import { marked } from './vendor/marked.js';
import DOMPurify from './vendor/purify.js';
import markedFootnote from './vendor/marked-footnote.js';
marked.use({gfm:true,breaks:false},markedFootnote({description:'Сноски',backRefLabel:'Вернуться к ссылке {0}'}));
const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
const base=local?new URL('/md/',location.origin):new URL('https://raw.githubusercontent.com/iworkup/monjaro/main/md/');
export async function loadMarkdown(path){
 const url=new URL(path,base);
 const response=await fetch(url,{signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('Не удалось загрузить Markdown');
 const source=await response.text();
 const article=document.createElement('article');article.className='markdown-body';
 article.innerHTML=DOMPurify.sanitize(marked.parse(source),{ADD_ATTR:['align']});
 // The first H1 is provided by the page template.
 article.querySelector(':scope > h1')?.remove();
 const used=new Map();
 article.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h=>{
  const slug=h.textContent.toLowerCase().replace(/[^\p{L}\p{N}_\s-]/gu,'').trim().replace(/\s/g,'-')||'heading';
  const count=used.get(slug)||0;used.set(slug,count+1);h.id=slug+(count?'-'+count:'');
 });
 article.querySelectorAll('table').forEach(table=>{const wrap=document.createElement('div');wrap.className='table-wrap';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','Таблица с горизонтальной прокруткой');table.before(wrap);wrap.append(table);});
 const labels={NOTE:'Примечание',TIP:'Совет',IMPORTANT:'Важно',WARNING:'Предупреждение',CAUTION:'Осторожно'};
 article.querySelectorAll('blockquote').forEach(block=>{
  const first=block.firstElementChild;if(first?.tagName!=='P')return;
  const marker=first.textContent.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/);if(!marker)return;
  const text=first.firstChild;if(text?.nodeType!==Node.TEXT_NODE)return;
  text.textContent=text.textContent.replace(marker[0],'');
  const label=document.createElement('p');label.className='alert-title';label.textContent=labels[marker[1]];
  block.classList.add('md-alert','alert-'+marker[1].toLowerCase());block.prepend(label);
 });
 article.querySelectorAll('img').forEach(img=>{img.src=new URL(img.getAttribute('src'),url);img.loading='lazy';});
 article.querySelectorAll('a[href]').forEach(a=>{const href=a.getAttribute('href');if(!href.startsWith('#'))a.href=new URL(href,url);});
 if(path==='markdown-demo.md'){
 const sourceDetails=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre'),code=document.createElement('code');
 summary.textContent='Показать исходный Markdown';code.textContent=source;pre.append(code);sourceDetails.append(summary,pre);sourceDetails.className='md-source';article.append(sourceDetails);
 }
 return article.outerHTML;
}

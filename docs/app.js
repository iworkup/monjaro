import {loadMarkdown} from './markdown.js';
const pages = {
  "/": {
    "section": "home",
    "title": "Главная",
    "markdown": "home.md"
  },
  "/faq": {
    "section": "faq",
    "title": "FAQ",
    "markdown": "faq.md"
  },
  "/articles": {
    "section": "articles",
    "title": "Статьи",
    "markdown": "articles.md"
  },
  "/apps": {
    "section": "apps",
    "title": "Приложения",
    "markdown": "apps.md"
  },
  "/articles/markdown": {
    "section": "articles",
    "title": "Доступные элементы оформления контента",
    "markdown": "markdown-demo.md"
  }
};
const treeData=[{title:'Главная',route:'/'},{title:'FAQ',route:'/faq'},{title:'Статьи',route:'/articles',children:[{title:'Доступные элементы оформления контента',route:'/articles/markdown'}]},{title:'Приложения',route:'/apps'}];
function makeTree(nodes,depth=1){
 const list=document.createElement('ul');list.className='page-tree';
 for(const node of nodes){
  const li=document.createElement('li'),row=document.createElement('div');row.className='tree-row';
  const link=document.createElement('a');link.href='#'+node.route;link.dataset.route=node.route;link.textContent=node.title;
  row.append(link);li.append(row);
  if(node.children?.length){
   const toggle=document.createElement('button');toggle.className='tree-toggle';toggle.textContent='›';toggle.setAttribute('aria-label','Подразделы: '+node.title);toggle.setAttribute('aria-expanded','true');
   const children=makeTree(node.children,depth+1);children.id='tree-'+node.route.replaceAll('/','-');toggle.setAttribute('aria-controls',children.id);
   toggle.addEventListener('click',()=>{children.hidden=!children.hidden;toggle.setAttribute('aria-expanded',String(!children.hidden));});row.prepend(toggle);li.append(children);
  } else row.classList.add('tree-leaf');
  list.append(li);
 }return list;
}
document.querySelector('#page-tree').append(makeTree(treeData));
const main=document.querySelector('main'), button=document.querySelector('#menu-toggle');
main.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||!a.closest('.markdown-body'))return;const href=a.getAttribute('href');if(href.startsWith('#/'))return;const target=main.querySelector('[id="'+CSS.escape(decodeURIComponent(href.slice(1)))+'"]');if(target){e.preventDefault();target.scrollIntoView();target.tabIndex=-1;target.focus({preventScroll:true});}});
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();main.focus();});
function closeMenu(){document.body.classList.remove('menu-open');button.setAttribute('aria-expanded','false');}
button.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');button.setAttribute('aria-expanded',String(open));if(open)document.querySelector('#sidebar a').focus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('menu-open')){closeMenu();button.focus();}if(e.key==='Tab'&&document.body.classList.contains('menu-open')){const items=[button,...Array.from(document.querySelectorAll('#sidebar a, #sidebar button')).filter(el=>el.getClientRects().length)],first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
document.querySelector('#sidebar').addEventListener('click',e=>{if(e.target.closest('a')){closeMenu();main.focus({preventScroll:true});}});
let renderVersion=0;
async function render(){const version=++renderVersion;const route=location.hash.slice(1)||'/',page=pages[route];closeMenu();if(!page){main.innerHTML='<h1>Страница не найдена</h1><p><a href="#/">Вернуться на главную →</a></p>';document.title='Страница не найдена — Geely Monjaro';}else{if(page.markdown&&!page.body){main.innerHTML=`<h1>${page.title}</h1><p role="status">Загрузка страницы…</p>`;try{page.body=await loadMarkdown(page.markdown);}catch{if(version!==renderVersion)return;main.innerHTML=`<h1>${page.title}</h1><p role="alert">Не удалось загрузить страницу. Обновите страницу, чтобы повторить.</p>`;return;}if(version!==renderVersion)return;}main.innerHTML=`<h1>${page.title}</h1><div class="meta page-meta">Дата обновления: <time>загрузка…</time></div>${page.body}`;document.title=`${page.title.replace('\n',' ')} — Geely Monjaro`;}
if(page) loadPageDate(page, main.querySelector('.page-meta time'));
document.querySelectorAll('#page-tree a').forEach(a=>{if(a.dataset.route===route){let parent=a.closest('ul');while(parent&&parent.id!=='page-tree'){parent.hidden=false;const toggle=parent.previousElementSibling?.querySelector('button');toggle?.setAttribute('aria-expanded','true');parent=parent.parentElement.closest('ul');}}});
document.querySelectorAll('[data-route]').forEach(a=>{a.removeAttribute('aria-current');if(a.dataset.route===route)a.setAttribute('aria-current','page');});document.querySelectorAll('[data-section]').forEach(a=>{a.removeAttribute('aria-current');if(a.dataset.section===page?.section)a.setAttribute('aria-current','page');});
const headings=[...main.querySelectorAll('h2[id]')],nav=document.querySelector('#toc-links');nav.replaceChildren();document.querySelector('.toc').hidden=!headings.length;headings.forEach(h=>{const a=document.createElement('a');a.textContent=h.textContent;a.href=`#${route}`;a.addEventListener('click',e=>{e.preventDefault();h.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});nav.append(a);});if(headings.length){const details=document.createElement('details');details.className='mobile-toc';const summary=document.createElement('summary');summary.textContent='Оглавление';details.append(summary,nav.cloneNode(true));details.querySelectorAll('a').forEach((a,i)=>a.addEventListener('click',e=>{e.preventDefault();details.open=false;headings[i].scrollIntoView();}));main.querySelector('.page-meta')?.after(details);}window.scrollTo(0,0);}
window.addEventListener('hashchange',()=>{render();main.focus({preventScroll:true});});matchMedia('(max-width:760px)').addEventListener('change',closeMenu);render();

// Repository push time, rather than the visitor's clock or a commit author date.
async function loadUpdateDate() {
  const element = document.querySelector('#updated-date');
  try {
    const response = await fetch('https://api.github.com/repos/iworkup/monjaro', {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'no-cache',
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error('Repository metadata unavailable');
    const { pushed_at } = await response.json();
    const date = new Date(pushed_at);
    if (!pushed_at || Number.isNaN(date.getTime())) throw new Error('Invalid push date');
    element.dateTime = date.toISOString();
    element.textContent = new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Moscow'
    }).format(date);
  } catch {
    element.textContent = 'недоступна';
    element.removeAttribute('datetime');
    element.title = 'Не удалось получить дату последнего push из GitHub. Обновите страницу позже.';
  }
}
loadUpdateDate();

async function loadPageDate(page, element) {
  if (!element) return;
  try {
    let value;
    const local=['127.0.0.1','localhost','[::1]'].includes(location.hostname);
    if(local){
      const response=await fetch('/md/'+page.markdown,{method:'HEAD',cache:'no-cache',signal:AbortSignal.timeout(8000)});
      if(!response.ok)throw new Error('Date unavailable');
      value=response.headers.get('Last-Modified');
    }else{
      const query=new URLSearchParams({path:'md/'+page.markdown,sha:'main',per_page:'1'});
      const response=await fetch('https://api.github.com/repos/iworkup/monjaro/commits?'+query,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(8000)});
      if(!response.ok)throw new Error('Date unavailable');
      const commits=await response.json();value=commits[0]?.commit?.committer?.date;
    }
    const date=new Date(value);
    if(!value||Number.isNaN(date.getTime()))throw new Error('Invalid date');
    element.dateTime=date.toISOString();
    element.textContent=new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Europe/Moscow'}).format(date);
  }catch{element.textContent='недоступна';element.title='Не удалось получить дату изменения файла страницы.';}
}

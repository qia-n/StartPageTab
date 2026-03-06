// 全局变量
var getIcon = 'https://icon.bqb.cool/?url=';
var window = window || {};
window.notesList = [];
window.localArr = [];
window.OperLog = '';
window.localNotesList = 'notesList';
window.localUrlList = 'urlList';
window.tempUrlItem = {title:"",icon:"",url:""};
window.operType = '';
window.notesTitle = '';

// 公共后缀列表（精简版，覆盖全球主流后缀）
window.PUBLIC_SUFFIX = new Set([
  'com', 'net', 'org', 'io', 'co', 'app', 'dev', 'xyz',
  'cn', 'uk', 'jp', 'kr', 'au', 'ca', 'de', 'fr', 'it', 'es',
  'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'edu.cn', 'ac.cn',
  'co.uk', 'co.jp', 'co.kr', 'co.nz', 'co.au', 'co.ca',
  'co.in', 'co.za', 'co.th', 'co.id', 'co.il', 'co.my'
]);

//搜索
function searchListener(){
    var search_str='https://cn.bing.com/search?q=';
    document.getElementById('search_input').addEventListener('keyup',function(e){
        var search_str_key = this.value;

        // var lxsearch = 'https://cn.bing.com/AS/Suggestions?pt=page.com&qry='+search_str_key+'&cp='+search_str_key.length+'&csr=1&pths=1&cvid=80A5A5B0DE9F4C3AA42EC6C65D6A8684';
            
        // get(lxsearch, function(response) {
        //         console.log(response);
        //     }, function(error) {
        //         console.error(error);
        //     });

        if(e.keyCode==13){
            var url=search_str + search_str_key;
            window.open(url,'_blank');
            WriteLog('搜索了，'+  +" !");
        }
    });
}

function bingSuggestCallback(data){
    alert('搜索',data);
}

function scriptLoadError() {
    console.error('❌ script标签加载失败（被拦截/地址错误）');
    alert('请求失败！请检查网络或关闭广告拦截插件');
}

function getBingSuggest(url) {
    url = `${url}&callback=bingSuggestCallback`;
    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.onerror =  scriptLoadError();
    const oldScript = document.getElementById('bing-script');
    if (oldScript) {
        document.body.removeChild(oldScript);
    }
    script.id = 'bing-script';
    document.body.appendChild(script);
}

function request(method, url, data, successCallback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            successCallback(xhr.responseText);
        } else {
            errorCallback(xhr.statusText);
        }
    };

    xhr.onerror = function() {
        errorCallback(xhr.statusText);
    };

    if (method === 'GET') {
        xhr.send();
    } else {
        xhr.send(JSON.stringify(data));
    }
}

function get(url, successCallback, errorCallback) {
    request('GET', url, null, successCallback, errorCallback);
}

function post(url, data, successCallback, errorCallback) {
    request('POST', url, data, successCallback, errorCallback);
}

function put(url, data, successCallback, errorCallback) {
    request('PUT', url, data, successCallback, errorCallback);
}

function del(url, successCallback, errorCallback) {
    request('DELETE', url, null, successCallback, errorCallback);
}

//初始化记事本
function initNote(){
    var data = window.localStorage.getItem(localNotesList);
    if(data==null){
        window.localStorage.setItem(localNotesList,JSON.stringify(window.notesList));
    }
}

//读取本地存储的记事本列表
function getNoteList(){
    var data = window.localStorage.getItem(localNotesList);
    if(data==null){
        initNote();
        data=window.localStorage.getItem(localNotesList);
    }
    return JSON.parse(data);
}

//初始化记事本目录
function ShowNotesList(){
    var div_list=document.querySelector('.notes_list');
    div_list.innerHTML='';
    var data = getNoteList();
    data.forEach(itm => {
        // onclick="openNote('${itm.title}'
        div_list.innerHTML+=
        `<div class="notes_list_itm")">
            ${itm.title}
         <div>`;
    });
    noteSearch(); //记事本搜索监听
    noteListRightClick(); //记事本目录右键监听
}

//记事本目录绑定右键
function noteListRightClick(){
    var div_list = document.getElementsByClassName('notes_list_itm');
    for (var i = 0; i < div_list.length; i++) {
        div_list[i].addEventListener('contextmenu', function(e) {
            if (e.button === 2){
                notesTitle=e.srcElement.innerText;
                WriteLog('点击了记事本：'+notesTitle);
                e.preventDefault();
                var x = e.clientX;
                var y = e.clientY;
                var menu = document.getElementById('note_list_menu');
                menu.style.left = x + 'px';
                menu.style.top = y + 'px';
                menu.style.display = 'block';
                menu.style.zIndex = 2;
                document.onclick = function(){
                    menu.style.display = 'none';
                }
            }
            e.preventDefault();
        });
        div_list[i].addEventListener('click',function(e){
            openNote(e.srcElement.innerText);
        });
    }
}

//打开记事本
function openNote(title){
    var data = getNoteList();
    var note=data.find(itm => itm.title==title);
    if(note==null){
        note={"title":title,"content":"",'IsOpen':true};
    }
    note.IsOpen=true;
    var div_note=document.querySelector('.notes_content');
    div_note.innerHTML=
    `<div class="notes_content_title">
        <h2>${note.title}</h2>
    </div>
    <textarea class="notes_content_text" cols="" rows="">${note.content}</textarea>`;
    WriteLog('点击了记事本:'+title+' 。');
}

//根据标题查找记事本
function findNote(title){
    var data = getNoteList();
    var note=data.find(itm => itm.title==title);
    return note;
}

//保存记事本
function noteSave(){
    var div_note=document.querySelector('.notes_content');
    var title=div_note.querySelector('.notes_content_title h2').innerText;
    var content=div_note.querySelector('.notes_content_text').value;
    var data = getNoteList();
    var note=data.find(itm => itm.title==title);
    if(note==null){
        note={"title":title,"content":content};
        data.push(note);
    }else{
        note.content=content;
    }
    window.localStorage.setItem(localNotesList,JSON.stringify(data));
    ShowNotesList();
    WriteLog('记事本：'+title+' 保存成功!');
    alert("保存成功！");
}

//创建新增记事本
function createNewNote(newTitle){
    var note=findNote(newTitle);
    if(note!=null){
        newTitle+="_"+note.length+1;
    }
    var div_note=document.querySelector('.notes_content');
    div_note.innerHTML=
    `<div class="notes_content_title">
        <h2>${newTitle}</h2>
    </div>
    <textarea class="notes_content_text" cols="" rows="">正文</textarea>`;
    WriteLog('新建记事本：'+newTitle+'。');
}

//记事本搜索
function noteSearch(){
    document.querySelector('.notes_search_input').addEventListener('keydown',function(e){
        if(e.keyCode==13){
            var title=e.srcElement.value;
            var data =findNote(title);
            if(data!=null){
                var div_note=document.querySelector('.notes_content');
                div_note.innerHTML=
                `<div class="notes_content_title">
                    <h2>${data.title}</h2>
                </div>
                <textarea class="notes_content_text" cols="" rows="">${data.content}</textarea>`;
                WriteLog('搜索了记事本：'+title+" 。");
            }else{
                createNewNote(title);
            }
        }
    });
}

//删除记事本
function RemoveNotes(title){
    var data = getNoteList();
    data.splice(data.findIndex(item => item.title === title), 1);
    window.localStorage.setItem(localNotesList,JSON.stringify(data));
    ShowNotesList();
    WriteLog('删除记事本:'+title+'!');
}

//关闭记事本
function CloseNotes(){
    var notes = document.getElementById('notes');
    notes.style.display="none";
    notes.style.zIndex=0;
}

//读取json，加载url列表项
//初始化url列表
function onloadUrlList(){
    var data = window.localStorage.getItem(localUrlList);
    if(data==null){
        window.localStorage.setItem(localUrlList,JSON.stringify(window.localArr));
    }
}

//读取本地存储的url列表
function getUrlList(){
    var urlList=window.localStorage.getItem(localUrlList);
    if(urlList==null){
        onloadUrlList();
        urlList=window.localStorage.getItem(localUrlList);
    }
    return JSON.parse(urlList);
}

//检查url是否已经存在
function checkUrlExist(title){
    var urlList=getUrlList();
    for(var i=0;i<urlList.length;i++){
        if(urlList[i].title==title){
            return true;
        }
    }
    return false;
}

//删除url列表项
function deleteUrl(title){
    var urlList=getUrlList();
    for(var i=0;i<urlList.length;i++){
        if(urlList[i].title==title){
            urlList.splice(i,1);
            WriteLog('删除url!');
            break;
        }
    }
    window.localStorage.setItem(localUrlList,JSON.stringify(urlList));
    ShowUrlList();
}

//添加url到列表
function addUrl(urlObj){
    var urlList=getUrlList();
    if(!checkUrlExist(urlObj.title)){
        urlList.push(urlObj);
        window.localStorage.setItem(localUrlList,JSON.stringify(urlList));
        ShowUrlList();
        WriteLog('新增url：'+urlObj.title+'!');
    }
    else{
        WriteLog('新增url失败，url：'+urlObj.title+'已存在!');
        alert("该网址已存在");
    }
}

//修改url列表项
function updateUrl(urlObj,title){
    var urlList=getUrlList();
    var res=false;
    for(var i=0;i<urlList.length;i++){
        if(urlObj.title!=title){
            if(checkUrlExist(urlObj.title)){
                WriteLog('新增url失败，url：'+urlObj.title+'已存在!');
                alert("该网址已存在");
                break;
            }
        }
        if(urlList[i].title==title){
            urlList.splice(i,1,urlObj);
            res=true;
            break;
        }
        
    }
    if(res==true){
        window.localStorage.setItem(localUrlList,JSON.stringify(urlList));
        WriteLog('修改url：'+title+' !');
        ShowUrlList();
    }
}

//读取指定url信息
function getUrlInfo(title){
    var urlList=getUrlList();
    for(var i=0;i<urlList.length;i++){
        if(urlList[i].title==title){
            return urlList[i];
        }
    }
    return null;
}

//读写本地数据，显示url列表
function ShowUrlList(){
    var div_list=document.querySelector('.div_list');
    div_list.innerHTML='';
    var data = getUrlList();
    data.forEach(itm => {
        var urlPath=itm.url;
        var icon=itm.icon;
        var title=itm.title;
        var isIconCustomer = itm.isIconCustomer;
        var imgHtml = `<img src="`+icon+`" alt="`+urlPath+`"/>`;
        if(!isIconCustomer) imgHtml = `<img src="https://favicon.im/`+getRootDomain(urlPath)+`?larger=true" alt="`+urlPath+`" loading="lazy"/>`;
        div_list.innerHTML+=
        `<div class="div_item">
            <div class='div_img'>
                ${imgHtml}
            </div>
            <div class="div_title" data-url="${urlPath}" data-title="${title}">`+title+`</div>
         <div>`;
    });
    div_list.innerHTML+=
    `<div class="div_item" id="add_url_btn" style="font-size:30px;display: flex;justify-content: center;align-items: center;">+</div>`;
    showMenu();//监听鼠标右键
    bindUrlClickEvents();//绑定URL点击事件
}

function OpenUrl(urlPath,title){
    if(title!='记事本')
    {
        WriteLog('打开url：'+urlPath);
        window.open(urlPath,"_blank");
    }
    else{
        var data = getNoteList();
        var note=data.find(itm => itm.IsOpen==true);
        var div_note=document.querySelector('.notes_content');
        div_note.innerHTML=
        `<div class="notes_content_title">
            <h2>${note.title}</h2>
        </div>
        <textarea class="notes_content_text" cols="" rows="">${note.content}</textarea>`;
        var notes = document.getElementById('notes');
        notes.style.display="block";
        notes.style.zIndex=1;
        OpenBgDig("记事本");
        WriteLog('打开 记事本!');
    }
}

//绑定URL点击事件
function bindUrlClickEvents() {
    var divTitles = document.querySelectorAll('.div_title');
    divTitles.forEach(function(titleDiv) {
        titleDiv.addEventListener('click', function() {
            var urlPath = this.getAttribute('data-url');
            var title = this.getAttribute('data-title');
            if (urlPath && title) {
                OpenUrl(urlPath, title);
            }
        });
    });
    
    // 新增URL按钮
    var addBtn = document.getElementById('add_url_btn');
    if (addBtn) {
        addBtn.addEventListener('click', OpenModel);
    }
}

//打开模态框
function OpenModel(){
    var modelDisLog=document.getElementById('modelDisLog');
    modelDisLog.style.display="block";
    modelDisLog.style.zIndex=1;
    OpenBgDig("url框");
    WriteLog('打开 url框!');
}

//关闭模态框
function CloseModel(){
    var modelDisLog=document.getElementById('modelDisLog');
    modelDisLog.style.display="none";
    modelDisLog.style.zIndex=0;
    tempUrlItem={title:"",icon:"",url:"",isIconCustomer:false};
    SetModelValue(tempUrlItem);
}

//模态框赋值
function SetModelValue(obj){
    document.getElementById('dialog_name').value=obj.title;
    document.getElementById('dialog_icon').value = obj.icon;
    document.getElementById('dialog_url').value = obj.url;
    document.getElementById('isIconCustomer').checked = obj.isIconCustomer;
    if(obj.isIconCustomer) document.getElementById('input_icon').style.display='block';
    else document.getElementById('input_icon').style.display='none';
}

//新增url列表 项
function add(){
    var obj={
        title:document.getElementById('dialog_name').value,
        icon:document.getElementById('dialog_icon').value,
        url:document.getElementById('dialog_url').value,
        isIconCustomer:document.getElementById('isIconCustomer').checked
    };
    if(operType=='编辑'){
        updateUrl(obj,tempUrlItem.title);
    }else{
        addUrl(obj);
        operType='新增';
    }
    ShowUrlList();
    CloseModel();
    CloseBgDig();
}

//鼠标右键菜单
function showMenu() {
    var menu = document.getElementById('menu');
    var contextmenu = document.getElementsByClassName('div_title');
    for (var i = 0; i < contextmenu.length; i++) {
        contextmenu[i].addEventListener('contextmenu', function(e){
            if (e.button === 2) {
                var el = e.srcElement.innerHTML;
                WriteLog('点击了 '+el);
                tempUrlItem=getUrlInfo(el);
                e.preventDefault();
                let scrollTop =document.documentElement.scrollTop || document.body.scrollTop;
                let scrollLeft =document.documentElement.scrollLeft || document.body.scrollLeft;
                menu.style.display = 'block';
                menu.style.left = e.clientX + scrollLeft + 'px';
                menu.style.top = e.clientY  + scrollTop + 'px';
                document.onclick = function(){
                    menu.style.display = 'none';
                }
            }
            e.preventDefault();
        });
    }
}

//显示右键点击的url信息
function getItemData(){
    operType='编辑';
    SetModelValue(tempUrlItem);
    OpenModel();
}

//监听工具右键菜单
function showMenuTool() {
    var menu = document.getElementById('cr_menu');
    var contextmenu = document.getElementById('tool_settings');
    contextmenu.addEventListener('contextmenu', function(e){
        if (e.button === 2) {
            var el = e.srcElement.innerHTML;
            WriteLog('点击了 '+el);
            e.preventDefault();
            let scrollTop =document.documentElement.scrollTop || document.body.scrollTop;
            let scrollLeft =document.documentElement.scrollLeft || document.body.scrollLeft;
            menu.style.display = 'block';
            menu.style.left = e.clientX + scrollLeft + 'px';
            menu.style.top = e.clientY  + scrollTop + 'px';
            document.onclick = function(){
                menu.style.display = 'none';
            }
        }
    e.preventDefault();
    });
}

//导出本地缓存
function Export(){
    createJsonFile();
}

//创建json文件
function createJsonFile(){
    var urlList=getUrlList();
    var notesList = getNoteList();
    var data={
        urlList:urlList,
        notesList:notesList
    };
    var jsonStr=JSON.stringify(data);
    var blob = new Blob([jsonStr], {type: "text/plain;charset=utf-8"});
    var a = document.createElement("a");
    var url = URL.createObjectURL(blob);
    a.href = url;
    a.download = "记事本和网址.json";
    a.click();
    URL.revokeObjectURL(url);
    WriteLog('导出本地缓存!');
}

//导入json文件
function openImport(){
    document.getElementById("import_file").addEventListener("change",function () {
        var file = document.getElementById("import_file").files[0];
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');
        reader.onload = function(e) {
            document.getElementById('import_file').value='';
            var data = JSON.parse(this.result);
            window.localStorage.setItem(localUrlList,JSON.stringify(data.urlList));
            window.localStorage.setItem(localNotesList,JSON.stringify(data.notesList));
            alert('写入成功！');
            ShowUrlList();
            ShowNotesList();
            WriteLog('导入本地缓存!');
        };
    });
}

// 监听dom拖拽
function dragNotes(dom){
    var draggable = dom;
    var offsetX, offsetY;

    draggable.addEventListener('mousedown', function(e) {
        offsetX = e.clientX - draggable.getBoundingClientRect().left;
        offsetY = e.clientY - draggable.getBoundingClientRect().top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        draggable.style.left = (e.clientX - offsetX) + 'px';
        draggable.style.top = (e.clientY - offsetY) + 'px';
    }
    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

//汇总拖拽监听
function drageDom(){
    dragNotes(document.getElementById('notes'));
    dragNotes(document.getElementById('modelDisLog'));
}

//本地登录
function LocalLogin(){
    if(window.localStorage.getItem("IsLocalLogin")){
        WriteLog('本地已登录！');
    }else{
        window.localStorage.setItem("IsLocalLogin",true);
        WriteLog('本地登录，登录成功！');
    }
}

// 打开登录
function OpenLogin(){
    WriteLog('打开 😀(登录块) ！');
    OpenBgDig('登录');
    var loginDom=document.getElementById("loginBox");
    loginDom.style.display="block";
    loginDom.style.zIndex=1;
} 

function CloseLogin(){
    var loginDom=document.getElementById("loginBox");
    loginDom.style.display="none";
    loginDom.style.zIndex=0;
}

// 打开配置
function OpenConfig(){
    WriteLog('打开 🏷️配置！');
    OpenBgDig('配置');
    var loginDom=document.getElementById("configBox");
    loginDom.style.display="block";
    loginDom.style.zIndex=1;
}

function CloseConfig(){
    var loginDom=document.getElementById("configBox");
    loginDom.style.display="none";
    loginDom.style.zIndex=0;
}

//读取本地操作记录
function ReadLog(){
    var data = window.localStorage.getItem('OperLog');
    if(data==undefined)
    {
        window.localStorage.setItem('OperLog','');
        return window.localStorage.getItem('OperLog');
    }
    else return data;
}

//写入本地操作记录
function WriteLog(logStr){
    return logStr;
    console.clear();
    var data = ReadLog();
    var logCount = '';
    data+=GetLocalDateTime()+'\t'+logCount+logStr +'\n';
    window.localStorage.setItem('OperLog',data);
}

//日志序号
function logIndex(){
    var data = Number(window.localStorage.getItem('logIndex'));
    console.log('次数',data);
    if(data==undefined){
        window.localStorage.setItem('logIndex',1);
        return 1;
    }
    else{
        data+=1;
        window.localStorage.setItem('logIndex',data);
        return data;
    }
}

/*
 * 获取当前日期时间
 * @return {string}
**/
function GetLocalDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//关闭背景弹框
function CloseBgDig(){
    var bgDig=document.getElementById('bgDig');
    var str_list=['url框','记事本','登录','配置'];
    if(str_list.find(x=>x==bgDig.className)){
        WriteLog('关闭 '+bgDig.className);
        CloseModel();
        CloseNotes();
        CloseLogin();
        CloseConfig();
    }
    document.getElementById('bgDig').style.display='none';
}

function OpenBgDig(title){
    var bgDig=document.getElementById('bgDig');
    bgDig.className=title;
    bgDig.style.display='block';
    bgDig.style.zIndex=0;
}

function Login(){
    var userInfo=localStorage.getItem('userInfo');
    if(userInfo==null){
        var userName=document.getElementById('login_username').value;
        var userPwd=document.getElementById('login_password').value;
        
        if(userName==''||userPwd==''){
            WriteLog('登录：用户名或密码不能为空！');
        }
        else{
            WriteLog('登录中...');
            var useInfo = {
                nickname:userName,
                account:userName,
                password: userPwd
            };
            post('http://localhost:5267/user/Login', useInfo, 
            function(response) {
                console.log(response);
            }, function(error) {
                console.error(error);
            });
        }
    }else{
        WriteLog('已登录');
    }
}

//页面刷新函数
function RefreshPage(){
    window.addEventListener('reload', function() {
        WriteLog('页面刷新了...');
    });
    window.addEventListener("beforeunload", (event) => {
        event.preventDefault();
        event.returnValue = "baidu.com";
        WriteLog('页面刷新了...');
    });
}

function checkChangeEvent(){
    const checkbox = document.getElementById('isIconCustomer');
    checkbox.addEventListener('change', function(event) {
        const isChecked = this.checked;
        if (isChecked) {
            document.getElementById('input_icon').style.display='block';
        } else {
            document.getElementById('input_icon').style.display='none';
        }
    });
}

/**
 * 提取根域名（原生JS，兼容所有网站）
 * @param {string} url - 网址/域名
 * @returns {string} 根域名（如 doubao.com）
 */
function getRootDomain(url) {
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch (e) {
    hostname = url.trim().toLowerCase();
  }
  const parts = hostname.split('.').reverse();
  let suffix = [];
  for (const part of parts) {
    suffix.unshift(part);
    const candidate = suffix.join('.');
    if (!window.PUBLIC_SUFFIX.has(candidate)) break;
  }
  const domainParts = parts.slice(suffix.length).reverse().concat(suffix);
  return domainParts.join('.');
}

// 初始化函数
function init() {
    console.log('数据载入中...');
    
    //初始笔记本数据
    window.notesList=[
        {"title":"示例","content":"点击搜索框下面的‘ + ’ 新增 记事本。",'IsOpen':true},
        {"title":"备忘录","content":"欢迎使用浅笑备忘录。",'IsOpen':false},
        {"title":"随笔","content":"记录有趣的事。",'IsOpen':false}
    ];
    
    //初始网址数据
    window.localArr=[
        {"icon":"https://note.ms/meta/favicon.png","url":"记事本","title":"记事本","isIconCustomer":true},
        {
            "icon":"https://57.gptchinese.app/assets/favicon-32x32.png",
            "url":"https://57.gptchinese.app/chat/new",
            "title":"ChatGPT",
            "isIconCustomer":false
        },
        {
            "icon":"https://www.hifini.com/view/img/logo.png",
            "url":"https://www.hifini.com/",
            "title":"音乐磁场-hifini",
            "isIconCustomer":false
        }
    ];
    
    window.OperLog='';
    window.localNotesList='notesList';
    window.localUrlList='urlList';
    window.tempUrlItem={title:"",icon:"",url:""};
    window.operType='';
    window.notesTitle='';

    // 公共后缀列表（精简版，覆盖全球主流后缀）
    window.PUBLIC_SUFFIX = new Set([
      'com', 'net', 'org', 'io', 'co', 'app', 'dev', 'xyz',
      'cn', 'uk', 'jp', 'kr', 'au', 'ca', 'de', 'fr', 'it', 'es',
      'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'edu.cn', 'ac.cn',
      'co.uk', 'co.jp', 'co.kr', 'co.nz', 'co.au', 'co.ca',
      'co.in', 'co.za', 'co.th', 'co.id', 'co.il', 'co.my'
    ]);

    searchListener(); //监听搜索框
    ShowUrlList(); //显示url列表
    ShowNotesList(); //显示记事本列表
    showMenuTool(); //监听工具右键菜单
    drageDom(); //监听记事本拖拽
    openImport();//导入json文件
    checkChangeEvent();//监听图标自定义复选框
    
    RefreshPage(); //页面刷新函数
    
    // 绑定所有事件监听器
    bindEventListeners();
    
    console.log('数据载入完成。');
}

// 绑定所有事件监听器
function bindEventListeners() {
    // 工具按钮事件
    document.getElementById('tool_config').addEventListener('click', OpenConfig);
    document.getElementById('tool_user').addEventListener('click', OpenLogin);
    
    // 导入导出事件
    document.getElementById('export_btn').addEventListener('click', Export);
    document.getElementById('import_container').addEventListener('click', function() {
        document.getElementById('import_file').click();
    });
    
    // 模态框按钮事件
    document.getElementById('dialog_cancel').addEventListener('click', CloseBgDig);
    document.getElementById('dialog_confirm').addEventListener('click', add);
    
    // 右键菜单事件
    document.getElementById('menu_edit').addEventListener('click', getItemData);
    document.getElementById('menu_delete').addEventListener('click', function() {
        if (tempUrlItem && tempUrlItem.title) {
            deleteUrl(tempUrlItem.title);
        }
    });
    
    // 记事本事件
    document.getElementById('notes_close').addEventListener('click', CloseBgDig);
    document.getElementById('notes_add').addEventListener('click', function() {
        createNewNote('新建记事本');
    });
    document.getElementById('notes_save').addEventListener('click', noteSave);
    
    // 记事本右键菜单事件
    document.getElementById('note_list_delete').addEventListener('click', function() {
        if (notesTitle) {
            RemoveNotes(notesTitle);
        }
    });
    
    // 登录框事件
    document.getElementById('login_close').addEventListener('click', CloseBgDig);
    document.getElementById('login_btn').addEventListener('click', Login);
    document.getElementById('local_login').addEventListener('click', LocalLogin);
    
    // 弹框背景点击事件
    document.getElementById('bgDig').addEventListener('click', CloseBgDig);
}

const timeEl = document.getElementById('time');
            const dateEl = document.getElementById('date');
            const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            
            function updateClock() {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                
                timeEl.textContent = `${hours}:${minutes}:${seconds}`;
                
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const weekDay = weekDays[now.getDay()];
                
                dateEl.textContent = `${year}年${month}月${day}日 ${weekDay}`;
                
                // 使用requestAnimationFrame优化性能
                requestAnimationFrame(updateClock);
            }
            
            

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    init();
    // 初始调用
            updateClock();
});
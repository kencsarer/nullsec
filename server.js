<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NullSec</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#c8ccd0;font-family:'Segoe UI',system-ui,sans-serif;height:100vh;overflow:hidden}
.auth-screen{display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px}
.auth-screen h1{font-size:42px;font-weight:900;color:#00ff88;text-shadow:0 0 20px rgba(0,255,136,.3)}
.auth-screen p{color:#555;font-size:13px;margin-bottom:10px}
.auth-screen input{background:#14141f;border:1px solid #2a2a3a;padding:12px 20px;border-radius:8px;color:#fff;font-size:15px;width:280px;outline:none}
.auth-screen input:focus{border-color:#00ff88}
.auth-screen .btn{background:linear-gradient(135deg,#00cc6a,#00ff88);border:none;padding:12px 40px;border-radius:8px;color:#000;font-weight:700;font-size:14px;cursor:pointer;width:280px}
.auth-screen .error{color:#ff4444;font-size:12px;min-height:18px}
.auth-screen .tabs{display:flex;gap:0;margin-bottom:10px}
.auth-screen .tab{padding:10px 24px;background:#14141f;border:1px solid #2a2a3a;color:#666;cursor:pointer;font-size:13px;font-weight:600}
.auth-screen .tab:first-child{border-radius:8px 0 0 8px}
.auth-screen .tab:last-child{border-radius:0 8px 8px 0}
.auth-screen .tab.active{background:#1a2a1f;border-color:#00ff88;color:#00ff88}
.app{display:none;height:100vh;grid-template-columns:220px 1fr 220px;grid-template-rows:50px 1fr}
.app.active{display:grid}
</style>
<style>
.header{grid-column:1/-1;background:#0d0d14;border-bottom:1px solid #1a1a2a;display:flex;align-items:center;padding:0 20px;gap:12px}
.header h1{font-size:16px;color:#00ff88;font-weight:800}
.header .channel-name{color:#666;font-size:13px}
.header .user-info{margin-left:auto;font-size:12px;color:#555;display:flex;align-items:center;gap:8px}
.header .user-info span{color:#00ff88}
.role-badge{font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;text-transform:uppercase}
.role-owner{background:#ff880030;color:#ffaa00;border:1px solid #ffaa0050}
.role-admin{background:#ff336630;color:#ff3366;border:1px solid #ff336650}
.role-mod{background:#33aaff30;color:#33aaff;border:1px solid #33aaff50}
.sidebar{background:#0d0d14;border-right:1px solid #1a1a2a;padding:12px;overflow-y:auto}
.sidebar h3{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#444;margin:16px 0 8px}
.channel-btn{display:block;width:100%;padding:8px 12px;background:transparent;border:none;color:#888;font-size:13px;text-align:left;border-radius:6px;cursor:pointer;margin:2px 0}
.channel-btn:hover{background:#1a1a2a;color:#ccc}
.channel-btn.active{background:#1a2a1f;color:#00ff88}
</style>
<style>
.dm-new-btn{display:block;width:100%;padding:6px 12px;background:transparent;border:1px dashed #2a2a3a;color:#555;font-size:11px;border-radius:6px;cursor:pointer;margin:4px 0}
.dm-new-btn:hover{border-color:#00ff88;color:#00ff88}
.dm-item{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;color:#888;margin:2px 0}
.dm-item:hover{background:#1a1a2a;color:#ccc}
.dm-item.active{background:#1a2a1f;color:#00ff88}
.dm-item .dm-unread{background:#00ff88;color:#000;font-size:9px;font-weight:700;padding:1px 5px;border-radius:10px;margin-left:auto}
.chat-area{display:flex;flex-direction:column;overflow:hidden;position:relative}
.messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:4px}
.msg{display:flex;gap:10px;padding:6px 8px;border-radius:6px;position:relative}
.msg:hover{background:#ffffff05}
.msg:hover .msg-actions{display:flex}
.msg-deleted{opacity:.7;border-left:3px solid #ff3366;padding-left:12px}
.msg-deleted .msg-text{color:#ff3366;font-style:italic}
.msg-mentioned{background:#ffaa0010;border-left:3px solid #ffaa00}
.msg-avatar{width:36px;height:36px;border-radius:50%;background:#1a1a2a;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;overflow:hidden}
.msg-avatar img{width:100%;height:100%;object-fit:cover}
.msg-content{flex:1}
.msg-header{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.msg-name{font-weight:700;font-size:13px}
.msg-badges{display:flex;gap:2px}
.msg-badges span{font-size:12px;cursor:default}
.msg-role{font-size:9px;padding:1px 5px;border-radius:3px;font-weight:600}
.msg-time{font-size:10px;color:#444}
.msg-text{font-size:14px;color:#ddd;margin-top:3px;word-break:break-word;line-height:1.4}
.msg-text .mention{color:#ffaa00;font-weight:600;background:#ffaa0015;padding:0 3px;border-radius:3px;cursor:pointer}
.msg-text .mention.mention-me{color:#00ff88;background:#00ff8820}
.msg-edited{font-size:10px;color:#555;font-style:italic}
.msg-img{max-width:300px;max-height:200px;border-radius:8px;margin-top:6px;cursor:pointer}
.msg-system{color:#555;font-size:12px;font-style:italic;padding:4px 46px}
</style>
<style>
.msg-actions{display:none;position:absolute;right:8px;top:4px;gap:4px}
.msg-actions button{background:#1a1a2a;border:1px solid #2a2a3a;color:#888;font-size:12px;padding:2px 6px;border-radius:4px;cursor:pointer}
.msg-actions button:hover{background:#2a2a3a;color:#fff}
.msg-reactions{display:flex;gap:4px;margin-top:4px;flex-wrap:wrap}
.reaction{background:#1a1a2a;border:1px solid #2a2a3a;border-radius:12px;padding:2px 8px;font-size:12px;cursor:pointer}
.reaction:hover{border-color:#00ff88}
.reaction.mine{border-color:#00ff88;background:#00ff8815}
.msg-reply-box{background:#1a1a2a;border-left:3px solid #33aaff;padding:4px 10px;margin-bottom:4px;border-radius:4px;font-size:11px;color:#888;cursor:pointer}
.msg-reply-box span{color:#33aaff;font-weight:600}
.reply-preview{background:#1a1a2a;border-left:3px solid #33aaff;padding:8px 12px;margin:0 16px;border-radius:4px;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#aaa}
.reply-preview button{background:none;border:none;color:#ff3366;font-size:16px;cursor:pointer;padding:0 4px}
.mention-popup{position:absolute;bottom:80px;left:80px;background:#12121a;border:1px solid #2a2a3a;border-radius:8px;display:none;flex-direction:column;max-height:200px;overflow-y:auto;z-index:100;min-width:180px}
.mention-popup.open{display:flex}
.mention-popup .mention-item{padding:8px 12px;cursor:pointer;font-size:13px;color:#ccc}
.mention-popup .mention-item:hover{background:#1a2a1f;color:#00ff88}
.dm-header{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid #1a1a2a;background:#0d0d14}
.dm-header span{font-weight:700;color:#ccc;font-size:14px}
.dm-back-btn{background:none;border:none;color:#00ff88;font-size:18px;cursor:pointer;padding:4px 8px}
</style>
<style>
.input-area{padding:12px 16px;border-top:1px solid #1a1a2a;display:flex;gap:8px;align-items:center}
.input-area input[type=text]{flex:1;background:#14141f;border:1px solid #2a2a3a;padding:10px 14px;border-radius:8px;color:#fff;font-size:14px;outline:none}
.input-area input[type=text]:focus{border-color:#00ff88}
.input-area label,.input-area .emoji-btn{cursor:pointer;padding:8px;border-radius:6px;background:#1a1a2a;color:#666;font-size:18px;border:none}
.input-area label:hover,.input-area .emoji-btn:hover{background:#2a2a3a;color:#00ff88}
.input-area input[type=file]{display:none}
.input-area button.send{background:#00ff88;border:none;padding:10px 16px;border-radius:8px;color:#000;font-weight:700;cursor:pointer}
.users-panel{background:#0d0d14;border-left:1px solid #1a1a2a;padding:12px;overflow-y:auto}
.users-panel h3{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#444;margin-bottom:10px}
.user-item{padding:6px 8px;font-size:12px;color:#888;border-radius:4px;display:flex;align-items:center;gap:6px;cursor:pointer}
.user-item:hover{background:#1a1a2a}
.user-item .user-avatar{width:20px;height:20px;border-radius:50%;background:#2a2a3a;overflow:hidden;flex-shrink:0}
.user-item .user-avatar img{width:100%;height:100%;object-fit:cover}
.user-item .dot{font-size:8px}
.user-item .user-role{font-size:9px;margin-left:auto;opacity:.6}
.user-item .user-badges{display:flex;gap:1px;margin-left:4px}
.user-item .user-badges span{font-size:10px}
.status-dot-online{color:#00ff88}
.status-dot-idle{color:#ffaa00}
.status-dot-dnd{color:#ff3366}
.status-dot-offline,.status-dot-invisible{color:#555}
.typing-indicator{font-size:11px;color:#555;padding:4px 16px;height:20px}
.admin-btn{display:block;width:100%;padding:8px;margin-top:6px;background:#ff336620;border:1px solid #ff336650;border-radius:6px;color:#ff3366;font-size:11px;font-weight:600;cursor:pointer;text-align:center}
.admin-btn:hover{background:#ff336640}
.avatar-btn{display:block;width:100%;padding:8px;margin-top:6px;background:#33aaff20;border:1px solid #33aaff50;border-radius:6px;color:#33aaff;font-size:11px;font-weight:600;cursor:pointer;text-align:center}
.avatar-btn:hover{background:#33aaff40}
</style>
<style>
.modal{position:fixed;inset:0;background:rgba(0,0,0,.8);display:none;align-items:center;justify-content:center;z-index:999}
.modal.open{display:flex}
.modal-box{background:#12121a;border:1px solid #2a2a3a;border-radius:12px;padding:24px;width:450px;max-height:80vh;overflow-y:auto}
.modal-box h2{font-size:16px;color:#00ff88;margin-bottom:16px}
.modal-box input,.modal-box select,.modal-box textarea{width:100%;background:#14141f;border:1px solid #2a2a3a;padding:10px;border-radius:6px;color:#fff;margin:6px 0;outline:none;font-family:inherit;resize:vertical}
.modal-box textarea{min-height:80px}
.modal-box button{padding:8px 16px;border-radius:6px;border:none;cursor:pointer;font-weight:600;margin:4px}
.modal-box .btn-green{background:#00ff88;color:#000}
.modal-box .btn-red{background:#ff3366;color:#fff}
.modal-box .btn-gray{background:#2a2a3a;color:#aaa}
.modal-box .btn-blue{background:#33aaff;color:#000}
.modal-user{display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #1a1a2a;font-size:12px}
.badge-grid{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.badge-item{padding:4px 10px;background:#1a1a2a;border:1px solid #2a2a3a;border-radius:6px;font-size:12px;cursor:pointer}
.badge-item:hover{border-color:#00ff88}
.badge-item.active{background:#00ff8820;border-color:#00ff88}
.emoji-picker{position:absolute;bottom:60px;left:60px;background:#12121a;border:1px solid #2a2a3a;border-radius:8px;padding:8px;display:none;flex-wrap:wrap;gap:4px;width:220px;z-index:99}
.emoji-picker.open{display:flex}
.emoji-picker span{font-size:20px;cursor:pointer;padding:4px;border-radius:4px}
.emoji-picker span:hover{background:#2a2a3a}
.status-options{display:flex;flex-direction:column;gap:8px;margin:8px 0}
.status-opt{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#14141f;border:1px solid #2a2a3a;border-radius:8px;cursor:pointer}
.status-opt:hover{border-color:#00ff88}
.status-opt.active{border-color:#00ff88;background:#00ff8810}
.status-opt .sdot{font-size:12px}
.notif-toast{position:fixed;top:12px;right:12px;background:#1a1a2a;border:1px solid #2a2a3a;color:#fff;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:600;z-index:1000;animation:slideIn .3s ease;cursor:pointer;max-width:300px}
.notif-toast.mention{border-color:#ffaa00}
.notif-toast.dm{border-color:#33aaff}
@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}
@media(max-width:768px){.app.active{grid-template-columns:1fr;grid-template-rows:50px 1fr}.sidebar,.users-panel{display:none}}
</style>
</head>
<body>
<div class="auth-screen" id="auth">
    <h1>NullSec</h1>
    <p>encrypted communications</p>
    <div class="tabs"><div class="tab active" onclick="switchAuthTab('login')">Login</div><div class="tab" onclick="switchAuthTab('register')">Register</div></div>
    <input type="text" id="auth-username" placeholder="Username" maxlength="20" autocomplete="off">
    <input type="password" id="auth-password" placeholder="Password" maxlength="50">
    <div class="error" id="auth-error"></div>
    <button class="btn" id="auth-btn" onclick="doAuth()">Login</button>
</div>
<div class="app" id="app">
    <div class="header">
        <h1>NullSec</h1>
        <span class="channel-name" id="header-channel"># general</span>
        <div class="user-info"><span id="header-user">-</span><span class="role-badge" id="header-role"></span></div>
    </div>
    <div class="sidebar">
        <h3>Channels</h3>
        <div id="channel-list"></div>
        <h3>Direct Messages</h3>
        <div id="dm-list"></div>
        <button class="dm-new-btn" onclick="openNewDM()">+ New DM</button>
        <h3>Online</h3>
        <div id="sidebar-users"></div>
        <button class="avatar-btn" onclick="openStatusModal()">Set Status</button>
        <button class="avatar-btn" onclick="openAvatarModal()">Set Avatar</button>
        <button class="avatar-btn" onclick="openBioModal()">Edit Bio</button>
        <button class="admin-btn" id="admin-btn" style="display:none" onclick="openAdmin()">Admin Panel</button>
    </div>
    <div class="chat-area" id="chat-area">
        <div class="messages" id="messages"></div>
        <div class="typing-indicator" id="typing"></div>
        <div class="emoji-picker" id="emoji-picker"></div>
        <div class="reply-preview" id="reply-preview" style="display:none">
            <span id="reply-preview-text"></span>
            <button onclick="cancelReply()">&#10005;</button>
        </div>
        <div class="mention-popup" id="mention-popup"></div>
        <div class="input-area">
            <label for="img-input">&#128206;</label>
            <input type="file" id="img-input" accept="image/*,image/gif">
            <button class="emoji-btn" onclick="toggleEmoji()">&#128512;</button>
            <input type="text" id="msg-input" placeholder="Message #general..." autocomplete="off">
            <button class="send" onclick="sendMessage()">Send</button>
        </div>
    </div>
    <!-- DM Chat Area (hidden by default) -->
    <div class="chat-area" id="dm-chat-area" style="display:none">
        <div class="dm-header" id="dm-header">
            <button class="dm-back-btn" onclick="closeDMChat()">&#8592;</button>
            <span id="dm-partner-name">User</span>
        </div>
        <div class="messages" id="dm-messages"></div>
        <div class="typing-indicator" id="dm-typing"></div>
        <div class="reply-preview" id="dm-reply-preview" style="display:none">
            <span id="dm-reply-preview-text"></span>
            <button onclick="cancelDMReply()">&#10005;</button>
        </div>
        <div class="input-area">
            <label for="dm-img-input">&#128206;</label>
            <input type="file" id="dm-img-input" accept="image/*,image/gif">
            <input type="text" id="dm-msg-input" placeholder="Send a message..." autocomplete="off">
            <button class="send" onclick="sendDM()">Send</button>
        </div>
    </div>
    <div class="users-panel">
        <h3>All Members</h3>
        <div id="users-list"></div>
    </div>
</div>
<!-- Admin Modal -->
<div class="modal" id="admin-modal"><div class="modal-box">
    <h2>Admin Panel</h2>
    <input id="admin-target" placeholder="Username...">
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin:8px 0">
        <button class="btn-green" onclick="adminAction('setRole','owner')">Owner</button>
        <button class="btn-green" onclick="adminAction('setRole','admin')">Admin</button>
        <button class="btn-blue" onclick="adminAction('setRole','mod')">Mod</button>
        <button class="btn-gray" onclick="adminAction('setRole','member')">Member</button>
        <button class="btn-red" onclick="adminAction('ban')">Ban</button>
        <button class="btn-gray" onclick="adminAction('unban')">Unban</button>
        <button class="btn-red" onclick="adminAction('mute')">Mute</button>
        <button class="btn-gray" onclick="adminAction('unmute')">Unmute</button>
    </div>
    <h3 style="color:#00ff88;font-size:11px;margin:12px 0 6px">Badges</h3>
    <div class="badge-grid" id="badge-grid"></div>
    <div style="display:flex;gap:4px;margin:6px 0">
        <button class="btn-green" onclick="adminAddBadge()">Give Badge</button>
        <button class="btn-red" onclick="adminRemoveBadge()">Remove Badge</button>
    </div>
    <h3 style="color:#555;font-size:11px;margin:12px 0 6px">Channels</h3>
    <input id="admin-channel" placeholder="Channel name...">
    <div style="display:flex;gap:4px;margin:6px 0">
        <button class="btn-green" onclick="adminCreateChannel()">Create</button>
        <button class="btn-red" onclick="adminDeleteChannel()">Delete</button>
    </div>
    <h3 style="color:#555;font-size:11px;margin:12px 0 6px">All Users</h3>
    <div id="admin-users"></div>
    <button class="btn-gray" onclick="closeAdmin()" style="margin-top:12px;width:100%">Close</button>
</div></div>
<!-- Avatar Modal -->
<div class="modal" id="avatar-modal"><div class="modal-box">
    <h2>Set Avatar</h2>
    <p style="color:#666;font-size:12px;margin-bottom:12px">Upload image or GIF (max 8MB)</p>
    <input type="file" id="avatar-file" accept="image/*,image/gif">
    <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn-green" onclick="uploadAvatar()">Upload</button>
        <button class="btn-gray" onclick="closeAvatarModal()">Cancel</button>
    </div>
</div></div>
<!-- Status Modal -->
<div class="modal" id="status-modal"><div class="modal-box" style="width:360px">
    <h2>Set Status</h2>
    <div class="status-options">
        <div class="status-opt" data-st="online" onclick="selectStatus('online')"><span class="sdot status-dot-online">&#9679;</span> Online</div>
        <div class="status-opt" data-st="idle" onclick="selectStatus('idle')"><span class="sdot status-dot-idle">&#9679;</span> Idle</div>
        <div class="status-opt" data-st="dnd" onclick="selectStatus('dnd')"><span class="sdot status-dot-dnd">&#9679;</span> Do Not Disturb</div>
        <div class="status-opt" data-st="invisible" onclick="selectStatus('invisible')"><span class="sdot status-dot-invisible">&#9679;</span> Invisible</div>
    </div>
    <input type="text" id="status-text-input" placeholder="Custom status text..." maxlength="100">
    <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn-green" onclick="saveStatus()">Save</button>
        <button class="btn-gray" onclick="closeStatusModal()">Cancel</button>
    </div>
</div></div>
<!-- Bio Modal -->
<div class="modal" id="bio-modal"><div class="modal-box" style="width:380px">
    <h2>Edit Bio</h2>
    <p style="color:#666;font-size:12px;margin-bottom:8px">Tell others about yourself (max 300 chars)</p>
    <textarea id="bio-input" placeholder="Write something about yourself..." maxlength="300"></textarea>
    <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn-green" onclick="saveBio()">Save</button>
        <button class="btn-gray" onclick="closeBioModal()">Cancel</button>
    </div>
</div></div>
<!-- New DM Modal -->
<div class="modal" id="newdm-modal"><div class="modal-box" style="width:340px">
    <h2>New Direct Message</h2>
    <input type="text" id="newdm-user" placeholder="Username...">
    <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn-green" onclick="startDM()">Open Chat</button>
        <button class="btn-gray" onclick="closeNewDM()">Cancel</button>
    </div>
</div></div>
<!-- Profile Popup -->
<div class="modal" id="profile-modal"><div class="modal-box" style="width:360px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div id="prof-avatar" style="width:50px;height:50px;border-radius:50%;background:#1a1a2a;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700"></div>
        <div><div id="prof-name" style="font-size:16px;font-weight:700"></div><div id="prof-role" class="role-badge" style="margin-top:4px"></div></div>
    </div>
    <div id="prof-badges" style="margin-bottom:12px"></div>
    <div id="prof-bio" style="font-size:13px;color:#bbb;margin-bottom:12px;padding:8px;background:#14141f;border-radius:6px;display:none"></div>
    <div style="font-size:12px;color:#888;display:flex;flex-direction:column;gap:6px">
        <div>Status: <span id="prof-status" style="color:#ccc"></span> <span id="prof-status-text" style="color:#888;font-style:italic"></span></div>
        <div>Registered: <span id="prof-created" style="color:#ccc"></span></div>
        <div>Last seen: <span id="prof-lastseen" style="color:#ccc"></span></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn-blue" onclick="dmFromProfile()">Send DM</button>
        <button class="btn-gray" onclick="closeProfile()">Close</button>
    </div>
</div></div>
<!-- Notification toast container -->
<div id="notif-container" style="position:fixed;top:12px;right:12px;z-index:1000;display:flex;flex-direction:column;gap:8px"></div>
<script src="/socket.io/socket.io.js"></script>
<script>
const socket=io();
let username="",myRole="member",myColor="",myAvatar="",myBadges=[],myBio="",myStatus="online",myStatusText="";
let authMode="login",currentChannel="general";
let BADGES={};
const EMOJIS=["😀","😂","🤣","😎","🔥","💀","👀","❤️","👍","👎","💯","🎮","⚡","🚀","💬","🤡","😈","👑","💎","🗿"];
let selectedBadge="";
let allUsersData=[];
let onlineUsersData=[];
let onlineUsernames=[];
let dmPartners=[];
let currentDMPartner=null;
let replyingTo=null;
let dmReplyingTo=null;
let inDMView=false;

// Audio context for notification sounds
let audioCtx=null;
function playNotifSound(){
    try{
        if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
        const osc=audioCtx.createOscillator();
        const gain=audioCtx.createGain();
        osc.connect(gain);gain.connect(audioCtx.destination);
        osc.type="sine";osc.frequency.setValueAtTime(880,audioCtx.currentTime);
        osc.frequency.setValueAtTime(1100,audioCtx.currentTime+0.05);
        gain.gain.setValueAtTime(0.3,audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.3);
        osc.start(audioCtx.currentTime);osc.stop(audioCtx.currentTime+0.3);
    }catch(e){}
}
function playMentionSound(){
    try{
        if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
        const osc=audioCtx.createOscillator();
        const gain=audioCtx.createGain();
        osc.connect(gain);gain.connect(audioCtx.destination);
        osc.type="sine";osc.frequency.setValueAtTime(600,audioCtx.currentTime);
        osc.frequency.setValueAtTime(900,audioCtx.currentTime+0.1);
        osc.frequency.setValueAtTime(1200,audioCtx.currentTime+0.2);
        gain.gain.setValueAtTime(0.4,audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.4);
        osc.start(audioCtx.currentTime);osc.stop(audioCtx.currentTime+0.4);
    }catch(e){}
}
function playDMSound(){
    try{
        if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
        const osc=audioCtx.createOscillator();
        const gain=audioCtx.createGain();
        osc.connect(gain);gain.connect(audioCtx.destination);
        osc.type="triangle";osc.frequency.setValueAtTime(500,audioCtx.currentTime);
        osc.frequency.setValueAtTime(800,audioCtx.currentTime+0.08);
        osc.frequency.setValueAtTime(1000,audioCtx.currentTime+0.15);
        gain.gain.setValueAtTime(0.35,audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.35);
        osc.start(audioCtx.currentTime);osc.stop(audioCtx.currentTime+0.35);
    }catch(e){}
}

function showToast(text,type){
    const c=document.getElementById("notif-container");
    const t=document.createElement("div");t.className="notif-toast "+(type||"");
    t.textContent=text;c.appendChild(t);
    setTimeout(()=>t.remove(),4000);
}

function switchAuthTab(m){authMode=m;document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));document.querySelectorAll(".tab")[m==="login"?0:1].classList.add("active");document.getElementById("auth-btn").textContent=m==="login"?"Login":"Register";document.getElementById("auth-error").textContent="";}
async function doAuth(){
    const u=document.getElementById("auth-username").value.trim(),p=document.getElementById("auth-password").value,err=document.getElementById("auth-error");err.textContent="";
    if(!u||!p){err.textContent="Fill both fields";return;}
    try{const res=await fetch("/"+authMode,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u,password:p})});const d=await res.json();
    if(d.error){err.textContent=d.error;return;}
    username=d.username;myRole=d.role||"member";myColor=d.color;myAvatar=d.avatar||"";myBadges=d.badges||[];myBio=d.bio||"";myStatus=d.status||"online";myStatusText=d.statusText||"";
    localStorage.setItem("ns_u",u);localStorage.setItem("ns_p",p);
    document.getElementById("auth").style.display="none";document.getElementById("app").classList.add("active");
    document.getElementById("header-user").textContent=username;setRoleBadge(document.getElementById("header-role"),myRole);
    if(["owner","admin","mod"].includes(myRole))document.getElementById("admin-btn").style.display="block";
    socket.emit("join",{username});}catch(e){err.textContent="Connection error";}
}
window.addEventListener("load",()=>{const u=localStorage.getItem("ns_u"),p=localStorage.getItem("ns_p");if(u&&p){document.getElementById("auth-username").value=u;document.getElementById("auth-password").value=p;doAuth();}});
document.getElementById("auth-username").addEventListener("keydown",e=>{if(e.key==="Enter")doAuth();});
document.getElementById("auth-password").addEventListener("keydown",e=>{if(e.key==="Enter")doAuth();});
</script>
<script>
function setRoleBadge(el,role){el.textContent=role;el.className="role-badge";if(role==="owner")el.classList.add("role-owner");else if(role==="admin")el.classList.add("role-admin");else if(role==="mod")el.classList.add("role-mod");else el.style.display="none";}
function getNameColor(role,badges){if(role==="owner")return"#ffaa00";if(role==="admin")return"#ff3366";if(role==="mod")return"#33aaff";if(badges&&badges.includes("premium"))return"#aa55ff";if(badges&&badges.includes("og"))return"#00ff88";if(badges&&badges.includes("early"))return"#ffcc00";return"#ffffff";}
function renderBadges(badges){if(!badges||!badges.length)return"";return badges.map(b=>BADGES[b]?'<span title="'+BADGES[b].label+'">'+BADGES[b].emoji+'</span>':'<span>'+b+'</span>').join("");}
function getStatusDot(status){
    const s=status||"offline";
    return '<span class="dot status-dot-'+s+'">&#9679;</span>';
}
function formatMentions(text){
    if(!text)return"";
    return escapeHtml(text).replace(/@(\w+)/g,(match,name)=>{
        const isMine=name.toLowerCase()===username;
        return '<span class="mention'+(isMine?" mention-me":"")+'" onclick="showProfile(\''+name.toLowerCase()+'\')">@'+name+'</span>';
    });
}

// Socket events
socket.on("init",d=>{
    BADGES=d.badgeList||{};allUsersData=d.allUsers||[];
    renderChannels(d.channels);renderMessages(d.messages);
    onlineUsersData=d.users||[];
    onlineUsernames=d.users.map(u=>u.username);
    renderOnlineUsers(d.users);renderAllUsers();
    currentChannel=d.channel;initBadgeGrid();
    dmPartners=d.dmPartners||[];renderDMList();
});
socket.on("message",m=>{
    if(!inDMView){appendMessage(m);autoScroll();}
    // Sound notification
    if(m.username!==username){
        if(m.mentions&&m.mentions.includes(username)){playMentionSound();showToast("@"+m.username+" mentioned you in #"+currentChannel,"mention");}
        else{playNotifSound();}
    }
});
socket.on("mentioned",d=>{playMentionSound();showToast(d.by+" mentioned you: "+d.text,"mention");});
socket.on("system",t=>{if(!inDMView){const el=document.createElement("div");el.className="msg-system";el.textContent=t;document.getElementById("messages").appendChild(el);autoScroll();}});
socket.on("channelHistory",d=>{currentChannel=d.channel;document.getElementById("header-channel").textContent="# "+d.channel;document.getElementById("msg-input").placeholder="Message #"+d.channel+"...";document.getElementById("messages").innerHTML="";renderMessages(d.messages);document.querySelectorAll(".channel-btn").forEach(b=>b.classList.toggle("active",b.dataset.ch===d.channel));});
socket.on("userlist",u=>{onlineUsersData=u;onlineUsernames=u.map(x=>x.username);renderOnlineUsers(u);renderAllUsers();});
socket.on("userStatusChanged",d=>{
    const u=allUsersData.find(x=>x.username===d.username);
    if(u){u.status=d.status;u.statusText=d.statusText;}
    renderAllUsers();
});
socket.on("channelList",ch=>renderChannels(ch));
socket.on("typing",u=>{const el=document.getElementById("typing");el.textContent=u+" is typing...";clearTimeout(el._t);el._t=setTimeout(()=>el.textContent="",2000);});
socket.on("messageEdited",d=>{const el=document.querySelector('[data-id="'+d.id+'"] .msg-text');if(el){el.innerHTML=formatMentions(d.text);if(!el.parentElement.querySelector(".msg-edited")){const s=document.createElement("span");s.className="msg-edited";s.textContent="(edited)";el.after(s);}}});
socket.on("messageDeleted",d=>{const el=document.querySelector('[data-id="'+d.id+'"]');if(el){el.classList.add("msg-deleted");const txt=el.querySelector(".msg-text");if(txt)txt.textContent="[Message deleted by "+d.deletedBy+"]";const acts=el.querySelector(".msg-actions");if(acts)acts.remove();const img=el.querySelector(".msg-img");if(img)img.remove();const reacts=el.querySelector(".msg-reactions");if(reacts)reacts.remove();}});
socket.on("messageReacted",d=>{const el=document.querySelector('[data-id="'+d.id+'"] .msg-reactions');if(el)el.innerHTML=renderReactions(d.id,d.reactions);});
socket.on("kicked",msg=>{alert(msg);localStorage.clear();location.reload();});
socket.on("adminUserList",users=>{document.getElementById("admin-users").innerHTML=users.map(u=>'<div class="modal-user"><span>'+u.username+" ["+u.role+"] "+(u.badges||[]).map(b=>BADGES[b]?BADGES[b].emoji:"").join("")+(u.banned?" BANNED":"")+(u.muted?" MUTED":"")+"</span></div>").join("");});
</script>
<script>
// DM Socket Events
socket.on("newDM",d=>{
    playDMSound();
    if(currentDMPartner&&(d.from===currentDMPartner||d.to===currentDMPartner)){
        appendDMMessage(d);autoScrollDM();
    }else{
        showToast("DM from "+d.from+": "+(d.text||"[image]").slice(0,50),"dm");
    }
    // Update DM partners list
    socket.emit("getDMPartners");
});
socket.on("dmSent",d=>{
    if(currentDMPartner&&(d.to===currentDMPartner)){
        appendDMMessage(d);autoScrollDM();
    }
    socket.emit("getDMPartners");
});
socket.on("dmHistory",d=>{
    document.getElementById("dm-messages").innerHTML="";
    d.messages.forEach(m=>appendDMMessage(m));
    autoScrollDM();
});
socket.on("dmPartnersList",d=>{dmPartners=d;renderDMList();});
socket.on("dmTyping",d=>{
    if(d.from===currentDMPartner){
        const el=document.getElementById("dm-typing");el.textContent=d.from+" is typing...";clearTimeout(el._t);el._t=setTimeout(()=>el.textContent="",2000);
    }
});
socket.on("bioUpdated",d=>{myBio=d.bio;});

// Render functions
function renderChannels(channels){
    const el=document.getElementById("channel-list");el.innerHTML="";
    channels.forEach(ch=>{const btn=document.createElement("button");btn.className="channel-btn"+(ch===currentChannel?" active":"");btn.textContent="# "+ch;btn.dataset.ch=ch;btn.onclick=()=>{closeDMChat();socket.emit("switchChannel",ch);};el.appendChild(btn);});
}
function renderMessages(msgs){msgs.forEach(m=>appendMessage(m));autoScroll();}
function renderOnlineUsers(users){
    const html=users.map(u=>{
        const av=u.avatar?'<img src="'+u.avatar+'">':'';
        const badges=renderBadges(u.badges);
        const statusDot=getStatusDot(u.status||"online");
        return '<div class="user-item" onclick="showProfile(\''+u.username+'\')"><div class="user-avatar">'+av+'</div>'+statusDot+u.username+'<span class="user-badges">'+badges+'</span><span class="user-role">'+(u.role!=="member"?u.role:"")+'</span></div>';
    }).join("");
    document.getElementById("sidebar-users").innerHTML=html;
}
function renderAllUsers(){
    const html=allUsersData.map(u=>{
        const isOnline=onlineUsernames.includes(u.username);
        const av=u.avatar?'<img src="'+u.avatar+'">':'';
        const badges=renderBadges(u.badges);
        const onlineData=onlineUsersData.find(x=>x.username===u.username);
        const status=isOnline?(onlineData?onlineData.status:"online"):(u.status||"offline");
        const statusDot=getStatusDot(status);
        return '<div class="user-item" onclick="showProfile(\''+u.username+'\')"><div class="user-avatar">'+av+'</div>'+statusDot+u.username+'<span class="user-badges">'+badges+'</span><span class="user-role">'+(u.role!=="member"?u.role:"")+'</span></div>';
    }).join("");
    document.getElementById("users-list").innerHTML=html;
}
function renderDMList(){
    const el=document.getElementById("dm-list");el.innerHTML="";
    dmPartners.sort((a,b)=>new Date(b.lastTimestamp)-new Date(a.lastTimestamp));
    dmPartners.forEach(p=>{
        const div=document.createElement("div");
        div.className="dm-item"+(currentDMPartner===p.username?" active":"");
        div.innerHTML=p.username+(p.unread?'<span class="dm-unread">'+p.unread+'</span>':"");
        div.onclick=()=>openDMChat(p.username);
        el.appendChild(div);
    });
}
</script>
<script>
// Profile
function showProfile(uname){
    const u=allUsersData.find(x=>x.username===uname);
    if(!u)return;
    const isOnline=onlineUsernames.includes(uname);
    const onlineData=onlineUsersData.find(x=>x.username===uname);
    document.getElementById("prof-avatar").innerHTML=u.avatar?'<img src="'+u.avatar+'" style="width:100%;height:100%;object-fit:cover">':'<span style="color:'+u.color+'">'+uname[0].toUpperCase()+'</span>';
    document.getElementById("prof-name").textContent=uname;document.getElementById("prof-name").style.color=u.color;
    setRoleBadge(document.getElementById("prof-role"),u.role);
    document.getElementById("prof-badges").innerHTML=renderBadges(u.badges);
    // Bio
    const bioEl=document.getElementById("prof-bio");
    if(u.bio){bioEl.textContent=u.bio;bioEl.style.display="block";}else{bioEl.style.display="none";}
    // Status
    const status=isOnline?(onlineData?onlineData.status:"online"):(u.status||"offline");
    const statusText=isOnline?(onlineData?onlineData.statusText:""):(u.statusText||"");
    const statusLabels={online:"Online",idle:"Idle",dnd:"Do Not Disturb",invisible:"Invisible",offline:"Offline"};
    document.getElementById("prof-status").textContent=statusLabels[status]||status;
    document.getElementById("prof-status").style.color=status==="online"?"#00ff88":status==="idle"?"#ffaa00":status==="dnd"?"#ff3366":"#555";
    document.getElementById("prof-status-text").textContent=statusText?'"'+statusText+'"':"";
    document.getElementById("prof-created").textContent=new Date(u.created).toLocaleDateString();
    document.getElementById("prof-lastseen").textContent=u.lastSeen?new Date(u.lastSeen).toLocaleString():"Never";
    document.getElementById("profile-modal").classList.add("open");
}
function closeProfile(){document.getElementById("profile-modal").classList.remove("open");}
function dmFromProfile(){
    const name=document.getElementById("prof-name").textContent;
    closeProfile();openDMChat(name);
}

// Append channel message
function appendMessage(m){
    const msgs=document.getElementById("messages");const el=document.createElement("div");
    const isMentioned=m.mentions&&m.mentions.includes(username);
    el.className="msg"+(m.deleted?" msg-deleted":"")+(isMentioned?" msg-mentioned":"");el.dataset.id=m._id||"";
    const avHtml=m.avatar?'<img src="'+m.avatar+'">':'<span>'+m.username[0].toUpperCase()+'</span>';
    const time=new Date(m.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    let roleBadge="";if(m.role&&m.role!=="member")roleBadge='<span class="msg-role role-'+m.role+'">'+m.role+"</span>";
    const badges='<span class="msg-badges">'+renderBadges(m.badges)+"</span>";
    const nameColor=getNameColor(m.role,m.badges);
    // Reply box
    let replyBox="";
    if(m.replyPreview){replyBox='<div class="msg-reply-box"><span>'+escapeHtml(m.replyPreview.username)+'</span> '+escapeHtml(m.replyPreview.text||"")+'</div>';}
    let content="";
    if(m.deleted){content='<div class="msg-text">[Message deleted by '+m.deletedBy+"]</div>";}
    else{
        if(m.text)content+='<div class="msg-text">'+formatMentions(m.text)+"</div>";
        if(m.edited)content+='<span class="msg-edited">(edited)</span>';
        if(m.image)content+='<img class="msg-img" src="'+m.image+'" onclick="window.open(this.src)">';
        content+='<div class="msg-reactions">'+renderReactions(m._id,m.reactions||{})+"</div>";
    }
    let actions="";
    if(!m.deleted){
        actions+='<button onclick="setReply(\''+m._id+'\',\''+escapeAttr(m.username)+'\',\''+escapeAttr((m.text||"").slice(0,40))+'\')">↩️</button>';
        if(m.username===username)actions+='<button onclick="editMsg(\''+m._id+'\')">✏️</button>';
        if(m.username===username||["owner","admin","mod"].includes(myRole))actions+='<button onclick="deleteMsg(\''+m._id+'\')">🗑️</button>';
        actions+='<button onclick="reactPicker(\''+m._id+'\')">😀</button>';
    }
    el.innerHTML='<div class="msg-avatar" style="color:'+nameColor+'">'+avHtml+'</div><div class="msg-content">'+replyBox+'<div class="msg-header"><span class="msg-name" style="color:'+nameColor+'">'+escapeHtml(m.username)+"</span>"+badges+roleBadge+'<span class="msg-time">'+time+"</span></div>"+content+'</div><div class="msg-actions">'+actions+"</div>";
    msgs.appendChild(el);
}
function renderReactions(id,reactions){let h="";for(const[emoji,users]of Object.entries(reactions||{})){if(!users.length)continue;const mine=users.includes(username)?"mine":"";h+='<span class="reaction '+mine+'" onclick="socket.emit(\'react\',{id:\''+id+"',emoji:'"+emoji+"'})\">"+emoji+" "+users.length+"</span>";}return h;}
</script>
<script>
// DM System
function openDMChat(partner){
    currentDMPartner=partner;inDMView=true;
    document.getElementById("chat-area").style.display="none";
    document.getElementById("dm-chat-area").style.display="flex";
    document.getElementById("dm-partner-name").textContent=partner;
    document.getElementById("dm-messages").innerHTML="";
    document.getElementById("header-channel").textContent="DM: "+partner;
    socket.emit("getDMs",{with:partner});
    renderDMList();
}
function closeDMChat(){
    inDMView=false;currentDMPartner=null;
    document.getElementById("chat-area").style.display="flex";
    document.getElementById("dm-chat-area").style.display="none";
    document.getElementById("header-channel").textContent="# "+currentChannel;
    dmReplyingTo=null;
    document.getElementById("dm-reply-preview").style.display="none";
}
function appendDMMessage(m){
    const msgs=document.getElementById("dm-messages");const el=document.createElement("div");
    el.className="msg";el.dataset.id=m._id||"";
    const isMe=m.from===username;
    const time=new Date(m.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    const nameColor=isMe?myColor:"#ccc";
    let replyBox="";
    if(m.replyPreview){replyBox='<div class="msg-reply-box"><span>'+escapeHtml(m.replyPreview.username)+'</span> '+escapeHtml(m.replyPreview.text||"")+'</div>';}
    let content="";
    if(m.text)content+='<div class="msg-text">'+formatMentions(m.text)+"</div>";
    if(m.image)content+='<img class="msg-img" src="'+m.image+'" onclick="window.open(this.src)">';
    let actions='<button onclick="setDMReply(\''+m._id+'\',\''+escapeAttr(m.from)+'\',\''+escapeAttr((m.text||"").slice(0,40))+'\')">↩️</button>';
    el.innerHTML='<div class="msg-avatar" style="color:'+nameColor+'"><span>'+(m.from||"?")[0].toUpperCase()+'</span></div><div class="msg-content">'+replyBox+'<div class="msg-header"><span class="msg-name" style="color:'+nameColor+'">'+escapeHtml(m.from||"")+'</span><span class="msg-time">'+time+'</span></div>'+content+'</div><div class="msg-actions">'+actions+'</div>';
    msgs.appendChild(el);
}
function sendDM(){
    const input=document.getElementById("dm-msg-input");const text=input.value.trim();
    if(!text||!currentDMPartner)return;
    socket.emit("sendDM",{to:currentDMPartner,text:text,replyTo:dmReplyingTo});
    input.value="";cancelDMReply();
}
document.getElementById("dm-msg-input").addEventListener("keydown",e=>{
    if(e.key==="Enter")sendDM();
    else socket.emit("dmTyping",{to:currentDMPartner});
});
document.getElementById("dm-img-input").addEventListener("change",async e=>{
    const file=e.target.files[0];if(!file||!currentDMPartner)return;
    const fd=new FormData();fd.append("image",file);
    const res=await fetch("/upload",{method:"POST",body:fd});const d=await res.json();
    if(d.url)socket.emit("sendDM",{to:currentDMPartner,text:"",image:d.url});
    e.target.value="";
});
function openNewDM(){document.getElementById("newdm-modal").classList.add("open");}
function closeNewDM(){document.getElementById("newdm-modal").classList.remove("open");}
function startDM(){
    const user=document.getElementById("newdm-user").value.trim().toLowerCase();
    if(!user){return;}closeNewDM();openDMChat(user);
}
function autoScrollDM(){const m=document.getElementById("dm-messages");m.scrollTop=m.scrollHeight;}

// Reply system
function setReply(id,user,text){
    replyingTo=id;
    document.getElementById("reply-preview").style.display="flex";
    document.getElementById("reply-preview-text").textContent="Replying to "+user+": "+text;
    document.getElementById("msg-input").focus();
}
function cancelReply(){replyingTo=null;document.getElementById("reply-preview").style.display="none";}
function setDMReply(id,user,text){
    dmReplyingTo=id;
    document.getElementById("dm-reply-preview").style.display="flex";
    document.getElementById("dm-reply-preview-text").textContent="Replying to "+user+": "+text;
    document.getElementById("dm-msg-input").focus();
}
function cancelDMReply(){dmReplyingTo=null;document.getElementById("dm-reply-preview").style.display="none";}
</script>
<script>
// @Mention autocomplete
const msgInput=document.getElementById("msg-input");
msgInput.addEventListener("input",e=>{
    const val=msgInput.value;const cursor=msgInput.selectionStart;
    const before=val.slice(0,cursor);const match=before.match(/@(\w*)$/);
    const popup=document.getElementById("mention-popup");
    if(match){
        const query=match[1].toLowerCase();
        const matches=allUsersData.filter(u=>u.username.startsWith(query)).slice(0,8);
        if(matches.length>0){
            popup.innerHTML=matches.map(u=>'<div class="mention-item" onmousedown="insertMention(\''+u.username+'\')">@'+u.username+'</div>').join("");
            popup.classList.add("open");
        }else{popup.classList.remove("open");}
    }else{popup.classList.remove("open");}
});
msgInput.addEventListener("blur",()=>{setTimeout(()=>document.getElementById("mention-popup").classList.remove("open"),200);});
function insertMention(uname){
    const val=msgInput.value;const cursor=msgInput.selectionStart;
    const before=val.slice(0,cursor);const after=val.slice(cursor);
    const newBefore=before.replace(/@(\w*)$/,"@"+uname+" ");
    msgInput.value=newBefore+after;
    msgInput.selectionStart=msgInput.selectionEnd=newBefore.length;
    document.getElementById("mention-popup").classList.remove("open");
    msgInput.focus();
}

// Message send with reply support
function sendMessage(){
    const input=document.getElementById("msg-input");const text=input.value.trim();
    if(!text)return;
    socket.emit("message",{text:text,replyTo:replyingTo});
    input.value="";cancelReply();
}
function editMsg(id){const text=prompt("Edit message:");if(text!==null)socket.emit("editMessage",{id:id,text:text});}
function deleteMsg(id){if(confirm("Delete this message?"))socket.emit("deleteMessage",{id:id});}
function reactPicker(id){const emoji=prompt("Emoji reaction:");if(emoji)socket.emit("react",{id:id,emoji:emoji});}

document.getElementById("msg-input").addEventListener("keydown",e=>{if(e.key==="Enter")sendMessage();else socket.emit("typing");});
document.getElementById("img-input").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;const fd=new FormData();fd.append("image",file);const res=await fetch("/upload",{method:"POST",body:fd});const d=await res.json();if(d.url)socket.emit("message",{text:"",image:d.url,replyTo:replyingTo});e.target.value="";cancelReply();});

// Emoji picker
function toggleEmoji(){document.getElementById("emoji-picker").classList.toggle("open");}
(()=>{const el=document.getElementById("emoji-picker");EMOJIS.forEach(e=>{const s=document.createElement("span");s.textContent=e;s.onclick=()=>{document.getElementById("msg-input").value+=e;el.classList.remove("open");};el.appendChild(s);});})();

// Status modal
let selectedStatusOpt="online";
function openStatusModal(){
    document.getElementById("status-modal").classList.add("open");
    selectedStatusOpt=myStatus;document.getElementById("status-text-input").value=myStatusText;
    document.querySelectorAll(".status-opt").forEach(o=>o.classList.toggle("active",o.dataset.st===selectedStatusOpt));
}
function closeStatusModal(){document.getElementById("status-modal").classList.remove("open");}
function selectStatus(s){
    selectedStatusOpt=s;
    document.querySelectorAll(".status-opt").forEach(o=>o.classList.toggle("active",o.dataset.st===s));
}
function saveStatus(){
    myStatus=selectedStatusOpt;myStatusText=document.getElementById("status-text-input").value.trim();
    socket.emit("setStatus",{status:myStatus,statusText:myStatusText});
    closeStatusModal();
}

// Bio modal
function openBioModal(){document.getElementById("bio-modal").classList.add("open");document.getElementById("bio-input").value=myBio;}
function closeBioModal(){document.getElementById("bio-modal").classList.remove("open");}
function saveBio(){
    myBio=document.getElementById("bio-input").value.trim();
    socket.emit("setBio",{bio:myBio});closeBioModal();
}
</script>
<script>
// Avatar
function openAvatarModal(){document.getElementById("avatar-modal").classList.add("open");}
function closeAvatarModal(){document.getElementById("avatar-modal").classList.remove("open");}
async function uploadAvatar(){
    const file=document.getElementById("avatar-file").files[0];
    if(!file)return;
    const fd=new FormData();fd.append("image",file);fd.append("username",username);
    const res=await fetch("/setAvatar",{method:"POST",body:fd});
    const d=await res.json();
    if(d.url){myAvatar=d.url;closeAvatarModal();alert("Avatar set! Rejoin to see it.");}
}

// Admin
function openAdmin(){document.getElementById("admin-modal").classList.add("open");socket.emit("admin",{action:"getUsers"});}
function closeAdmin(){document.getElementById("admin-modal").classList.remove("open");}
function adminAction(action,role){const target=document.getElementById("admin-target").value.trim();if(!target)return;socket.emit("admin",{action:action,target:target,role:role});}
function adminCreateChannel(){const name=document.getElementById("admin-channel").value.trim();if(name)socket.emit("admin",{action:"createChannel",name:name});}
function adminDeleteChannel(){const name=document.getElementById("admin-channel").value.trim();if(name&&confirm("Delete #"+name+"?"))socket.emit("admin",{action:"deleteChannel",name:name});}

// Badges
function initBadgeGrid(){
    const el=document.getElementById("badge-grid");el.innerHTML="";
    for(const[key,val]of Object.entries(BADGES)){
        const item=document.createElement("div");item.className="badge-item"+(selectedBadge===key?" active":"");
        item.textContent=val.emoji+" "+val.label;item.onclick=()=>{selectedBadge=key;document.querySelectorAll(".badge-item").forEach(i=>i.classList.remove("active"));item.classList.add("active");};
        el.appendChild(item);
    }
}
function adminAddBadge(){const target=document.getElementById("admin-target").value.trim();if(!target||!selectedBadge)return;socket.emit("admin",{action:"addBadge",target:target,badge:selectedBadge});}
function adminRemoveBadge(){const target=document.getElementById("admin-target").value.trim();if(!target||!selectedBadge)return;socket.emit("admin",{action:"removeBadge",target:target,badge:selectedBadge});}

// Utils
function autoScroll(){const m=document.getElementById("messages");m.scrollTop=m.scrollHeight;}
function escapeHtml(s){const d=document.createElement("div");d.textContent=s;return d.innerHTML;}
function escapeAttr(s){return(s||"").replace(/'/g,"&#39;").replace(/"/g,"&quot;");}
document.addEventListener("visibilitychange",()=>{if(!document.hidden)document.title="NullSec";});
</script>
</body>
</html>

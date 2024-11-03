// 課程筆記內容，支援 Markdown 格式
const notesContent = `
## 5.1.1 Runtime [[Stack]]
- 使用[[ESP]]這個暫存器
- 很少直接操作，通常通過指令例如[[call]]，[[RET]], [[Push]], [[pop]]

## 5.1.2 [[PUSH]] and [[POP]] Instructions
1. [[push]]:加入值
2. [[pop]]:取出值
3. [[pushfd]]、[[popfd]]:操作[[EFLAGS]]暫存器
4. [[PUSHAD]]、[[POPAD]]:放[[reg|暫存器]]
5. [[PUSHA]]、[[POPA]]:[[16位元]]時使用

#### 範例:反轉字串
\`\`\`assembly
; 反轉字串 (RevStr.asm)
.386
.model flat,stdcall
.stack 4096
ExitProcess PROTO,dwExitCode:DWORD

.data
 aName BYTE "Abraham Lincoln",0
 nameSize = ($ - aName) - 1
 
.code
main PROC

 ; 將字串推入堆疊
 mov ecx,nameSize
 mov esi,0
 
L1: 
	movzx eax,aName[esi] ; 獲取字元
	push eax ; 推入堆疊
	inc esi
	loop L1

 ; 反向彈出字元並存回字串
 mov ecx,nameSize
 mov esi,0
 
L2: 
	pop eax ; 獲取字元
	mov aName[esi],al ; 存回字串
	inc esi
	loop L2

INVOKE ExitProcess,0
main ENDP
END main
\`\`\`
`;

// 動態插入課程筆記
$(document).ready(function() {
    const notesDiv = $('#notes');

    // 將 `[[ ]]` 內容轉為超連結
    const processedContent = notesContent.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, function(match, p1, p2, p3) {
        const linkText = p3 || p1;
        const url = `#${linkText}`; // 這裡設置跳轉連結的實際網址，根據需要進行調整
        return `<a href="${url}">${linkText}</a>`;
    });

    // 顯示筆記內容
    notesDiv.html(processedContent);

    // 所有的連結都加上事件監聽器
    const links = notesDiv.find("a");
    links.each(function() {
        const link = $(this);
        link.on("click", function(event) {
            event.preventDefault(); // 防止默認行為
            const page = link.attr("href").substring(1); // 去掉 "#" 符號獲取對應的頁面名稱
            loadPage(page); // 載入對應頁面內容
        });
    });

    // 定義載入內容的函式
    function loadPage(page) {
        fetch(page + '.html') // 假設所有連結對應的 HTML 文件名稱為 {link}.html
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text(); // 解析文本
            })
            .then(html => {
                notesDiv.html(html); // 更新內容
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                notesDiv.html("<p>載入內容失敗。</p>");
            });
    }
});

$(document).ready(function() {
    $('#searchButton').on('click', function() {
        const query = $('#searchInput').val(); // 獲取用戶輸入的搜尋關鍵字

        $.ajax({
            url: 'your-api-endpoint', // 替換為您的 API 端點
            method: 'GET',
            data: { search: query }, // 傳遞搜尋關鍵字
            success: function(data) {
                // 假設返回的數據是一個筆記的數組
                let notesHtml = '';

                // 處理返回的筆記數據並生成 HTML
                data.forEach(note => {
                    notesHtml += `<h3>${note.title}</h3><p>${note.content}</p>`;
                });

                $('#notes').html(notesHtml); // 更新顯示筆記的區域
            },
            error: function(err) {
                console.error('搜尋失敗:', err);
                $('#notes').html('<p>搜尋失敗，請重試。</p>');
            }
        });
    });
});

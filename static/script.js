document.getElementById('generate').addEventListener('click', async () => {
    const prompt = document.getElementById('prompt').value.trim();
    if (!prompt) return;

    const result = document.getElementById('result');
    result.textContent = '...';

    const response = await fetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
        result.textContent = 'حدث خطأ';
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let imageUrl = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        imageUrl += decoder.decode(value, { stream: true });
    }

    imageUrl = imageUrl.trim();
    if (imageUrl) {
        result.innerHTML = `<img src="${imageUrl}" alt="result"> <a href="${imageUrl}" download>تحميل</a>`;
    } else {
        result.textContent = 'لم يتم الحصول على رابط الصورة';
    }
});

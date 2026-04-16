// js/editor.js

document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('jsoneditor');
    const textarea = document.createElement('textarea');
    textarea.className = 'json-textarea';
    textarea.id = 'jsonEditorTextarea';
    textarea.spellcheck = false;
    textarea.setAttribute('aria-label', 'Website JSON editor');
    container.innerHTML = '';
    container.appendChild(textarea);

    async function loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            textarea.value = JSON.stringify(data, null, 2);
            showAlert('Data loaded successfully!', 'success');
        } catch (error) {
            console.error('Error loading JSON data:', error);
            showAlert('Failed to load data.json. If you are opening this file with the file:// protocol, use a local server like Live Server or GitHub Pages so fetch() can read the JSON file.', 'danger');
        }
    }

    function getParsedJson() {
        const raw = textarea.value.trim();

        if (!raw) {
            throw new Error('JSON editor is empty.');
        }

        return JSON.parse(raw);
    }

    function downloadJson(data) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');

        anchor.href = url;
        anchor.download = 'data.json';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }

    loadData();

    document.getElementById('btnDownload').addEventListener('click', function () {
        try {
            const updatedJson = getParsedJson();
            downloadJson(updatedJson);
            showAlert('data.json downloaded. Replace the old file in your project folder.', 'success');
        } catch (error) {
            console.error('Error exporting JSON:', error);
            showAlert(`JSON format error: ${error.message}`, 'danger');
        }
    });

    document.getElementById('btnReload').addEventListener('click', function () {
        if (confirm('Are you sure you want to reload? Any unsaved changes will be lost.')) {
            loadData();
        }
    });

    function showAlert(message, type) {
        const placeholder = document.getElementById('alertPlaceholder');
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
                ${type === 'success' ? '<i class="fas fa-check-circle me-2"></i>' : '<i class="fas fa-exclamation-circle me-2"></i>'}
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        placeholder.innerHTML = alertHtml;

        if (type === 'success') {
            setTimeout(() => {
                const alertElement = placeholder.querySelector('.alert');
                if (alertElement && typeof bootstrap !== 'undefined' && bootstrap.Alert) {
                    const bsAlert = new bootstrap.Alert(alertElement);
                    bsAlert.close();
                } else if (alertElement) {
                    alertElement.remove();
                }
            }, 5000);
        }
    }
});

// js/editor.js

document.addEventListener('DOMContentLoaded', function () {
    // 1. Initialize JSON Editor Component
    const container = document.getElementById('jsoneditor');
    const options = {
        mode: 'tree',
        modes: ['tree', 'form', 'code'], // Allowed modes
        name: 'Website Data',
        search: true,
        history: true,
        navigationBar: true,
        statusBar: true,
        onEditable: function (node) {
            // Make root node uneditable, but everything else editable
            if (!node || !node.path) {
                return false;
            }
            return true;
        }
    };
    const editor = new JSONEditor(container, options);

    // 2. Fetch and Load data.json
    async function loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            editor.set(data);
            editor.expandAll();
            showAlert('Data loaded successfully!', 'success');
        } catch (error) {
            console.error('Error loading JSON data:', error);
            showAlert('Failed to load data.json. If you are viewing this via file:// protocol directly, modern browsers block fetching local files via JS due to security policies. Use a local server (like Live Server extension in VS Code).', 'danger');
        }
    }

    // 3. Initial Load
    loadData();

    // 4. Download / Export Logic
    document.getElementById('btnDownload').addEventListener('click', function () {
        try {
            // Get current json from editor
            const updatedJson = editor.get();
            const jsonString = JSON.stringify(updatedJson, null, 2);

            // Create a Blob from the JSON string
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            // Create a temporary anchor element and trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data.json';
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showAlert('data.json downloaded! Replace the old file in your directory.', 'success');
        } catch (error) {
            console.error('Error exporting JSON:', error);
            showAlert('Error generating file. Make sure your JSON format is correct.', 'danger');
        }
    });

    // 5. Reload Logic
    document.getElementById('btnReload').addEventListener('click', function() {
        if(confirm('Are you sure you want to reload? Any unsaved changes will be lost.')) {
            loadData();
        }
    });

    // Helper: Show Bootstrap Alerts
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
        
        // Auto dismiss after 5 seconds if success
        if(type === 'success') {
            setTimeout(() => {
                const alertElement = placeholder.querySelector('.alert');
                if(alertElement) {
                    const bsAlert = new bootstrap.Alert(alertElement);
                    bsAlert.close();
                }
            }, 5000);
        }
    }
});

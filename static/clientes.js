// clientes.js
document.getElementById('clienteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const cedula = document.getElementById('cedula').value;
    const celular = document.getElementById('celular').value;
    const email = document.getElementById('email').value;
    const direccion = document.getElementById('direccion').value;
    
    try {
        const response = await fetch('/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, cedula, celular, email, direccion })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            document.getElementById('clienteForm').reset();
            cargarClientes();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error en la solicitud: ' + error);
    }
});

async function cargarClientes() {
    try {
        const response = await fetch('/clientes');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const tbody = doc.querySelector('#clientesTable tbody');
        document.querySelector('#clientesTable tbody').innerHTML = tbody.innerHTML;
    } catch (error) {
        console.error('Error:', error);
    }
}

function eliminarCliente(id) {
    if (confirm('¿Desea eliminar este cliente?')) {
        fetch(`/api/clientes/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            location.reload();
        })
        .catch(error => alert('Error: ' + error));
    }
}

// Cargar clientes al abrir la página
window.addEventListener('DOMContentLoaded', cargarClientes);

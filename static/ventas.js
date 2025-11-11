// ventas.js
let productosEnVenta = [];

async function cargarClientes() {
    try {
        const response = await fetch('/clientes');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const select = document.getElementById('cliente');
        
        // Obtener datos de clientes
        const rows = doc.querySelectorAll('#clientesTable tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const id = cells[0].textContent.trim();
                const nombre = cells[1].textContent.trim();
                
                if (!select.querySelector(`option[value="${id}"]`)) {
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = nombre;
                    select.appendChild(option);
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarProductos() {
    try {
        const response = await fetch('/productos');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const select = document.getElementById('producto');
        
        const rows = doc.querySelectorAll('#productosTable tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const id = cells[0].textContent.trim();
                const nombre = cells[0].textContent.trim();
                const precio = parseFloat(cells[2].textContent.trim());
                const stock = parseInt(cells[3].textContent.trim());
                
                if (!select.querySelector(`option[value="${id}"]`)) {
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = `${nombre} - $${precio}`;
                    option.dataset.precio = precio;
                    option.dataset.stock = stock;
                    select.appendChild(option);
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function agregarProducto() {
    const productoId = document.getElementById('producto').value;
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const clienteId = document.getElementById('cliente').value;
    
    if (!clienteId) {
        alert('Seleccione un cliente');
        return;
    }
    
    if (!productoId) {
        alert('Seleccione un producto');
        return;
    }
    
    if (cantidad <= 0) {
        alert('Ingrese una cantidad válida');
        return;
    }
    
    const select = document.getElementById('producto');
    const option = select.querySelector(`option[value="${productoId}"]`);
    const precio = parseFloat(option.dataset.precio);
    const stock = parseInt(option.dataset.stock);
    
    if (cantidad > stock) {
        alert('No hay stock suficiente');
        return;
    }
    
    const subtotal = precio * cantidad;
    
    const tbody = document.querySelector('#productosVenta tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${option.textContent.split(' - ')[0]}</td>
        <td>${cantidad}</td>
        <td>$${precio.toFixed(2)}</td>
        <td>$${subtotal.toFixed(2)}</td>
        <td><button class="btn-danger" onclick="this.parentElement.parentElement.remove(); calcularTotal()">Eliminar</button></td>
    `;
    
    productosEnVenta.push({
        producto_id: productoId,
        cantidad: cantidad,
        precio: precio,
        subtotal: subtotal
    });
    
    tbody.appendChild(row);
    document.getElementById('cantidad').value = '1';
    calcularTotal();
}

function calcularTotal() {
    const rows = document.querySelectorAll('#productosVenta tbody tr');
    let total = 0;
    
    rows.forEach(row => {
        const subtotal = parseFloat(row.querySelectorAll('td')[3].textContent.replace('$', ''));
        total += subtotal;
    });
    
    document.getElementById('totalVenta').textContent = total.toFixed(2);
}

function registrarVenta() {
    const clienteId = document.getElementById('cliente').value;
    const numeroFactura = document.getElementById('numeroFactura').value;
    const tbody = document.querySelector('#productosVenta tbody');
    
    if (!clienteId) {
        alert('Seleccione un cliente');
        return;
    }
    
    if (tbody.children.length === 0) {
        alert('Agregue al menos un producto');
        return;
    }
    
    const total = parseFloat(document.getElementById('totalVenta').textContent);
    
    const items = [];
    tbody.querySelectorAll('tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        const productoId = cells[0].textContent.trim();
        const cantidad = parseInt(cells[1].textContent.trim());
        const precio = parseFloat(cells[2].textContent.replace('$', ''));
        const subtotal = parseFloat(cells[3].textContent.replace('$', ''));
        
        items.push({
            producto_id: productoId,
            cantidad: cantidad,
            precio: precio,
            subtotal: subtotal
        });
    });
    
    const venta = {
        numero_factura: numeroFactura,
        cliente_id: clienteId,
        total: total,
        items: items
    };
    
    fetch('/api/ventas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(venta)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Venta registrada correctamente');
            limpiarVenta();
            location.reload();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => alert('Error: ' + error));
}

function limpiarVenta() {
    document.getElementById('cliente').value = '';
    document.getElementById('producto').value = '';
    document.getElementById('cantidad').value = '1';
    document.querySelector('#productosVenta tbody').innerHTML = '';
    productosEnVenta = [];
    document.getElementById('totalVenta').textContent = '0.00';
}

window.addEventListener('DOMContentLoaded', () => {
    cargarClientes();
    cargarProductos();
});

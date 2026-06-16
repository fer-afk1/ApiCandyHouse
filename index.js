const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(express.json());

// Conexión a MongoDB Atlas 
const MONGO_URI = 'mongodb+srv://fertorres11188_db_user:1234@clustercandy.56wg65p.mongodb.net/candyhouse?appName=ClusterCandy';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

//Modelos

// Modelo de Dulce
const dulceSchema = new mongoose.Schema({
    id:             { type: Number, required: true, unique: true },
    nombre:         { type: String, required: true },
    precio:         { type: Number, required: true },
    estado:         { type: String, enum: ['Optimo', 'Bajo'], required: true },
    imageUrl:       { type: String },
    proveedor:      { type: String },
    existencia:     { type: String },
    pasillo:        { type: String },
    fechaCaducidad: { type: String },
    categoria:      { type: String, enum: ['Gomitas', 'Chocolates', 'Bebidas', 'Importados'] }
});

const Dulce = mongoose.model('Dulce', dulceSchema);

// Modelo de Historial de Movimientos
const historialSchema = new mongoose.Schema({
    producto:  { type: String, required: true },
    accion:    { type: String, enum: ['Venta', 'Surtido', 'Ajuste'], required: true },
    cantidad:  { type: String, required: true },
    fecha:     { type: String, required: true }
});

const Historial = mongoose.model('Historial', historialSchema);

// Carrito global en memoria (se limpia al confirmar compra)
let carritoGlobal = [];

function parsearExistencia(existenciaStr) {
    if (!existenciaStr) return 0;
    const num = parseInt(existenciaStr.toString().replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
}


function formatearExistencia(cantidad) {
    return `${cantidad} pz`;
}

// Determina estado según existencia
function calcularEstado(cantidad) {
    return cantidad <= 50 ? 'Bajo' : 'Optimo';
}

// Datos Iniciales
const dulcesIniciales = [
    { id: 1,  nombre: "Gomitas de Ositos",          precio: 15.00, estado: "Optimo", imageUrl: "https://dulcerialaestrella.com.mx/cdn/shop/files/IMG_1821_1200x.png?v=1770832581",                                                                           proveedor: "Dulceria Denny",                  existencia: "150 pz", pasillo: "B-04", fechaCaducidad: "05/2028", categoria: "Gomitas" },
    { id: 2,  nombre: "Paleta Payaso",               precio: 25.00, estado: "Bajo",   imageUrl: "https://i5.walmartimages.com.mx/samsmx/images/product-images/img_large/980022677l.jpg",                                                                      proveedor: "Dulceria La Providencia",         existencia: "45 pz",  pasillo: "A-02", fechaCaducidad: "10/2027", categoria: "Gomitas" },
    { id: 3,  nombre: "Gomitas de Aros",             precio: 18.50, estado: "Optimo", imageUrl: "https://m.media-amazon.com/images/I/71wN8PXFmGL.jpg",                                                                                                        proveedor: "Dulcerias y Abarroteras Vazquez", existencia: "200 pz", pasillo: "B-04", fechaCaducidad: "12/2027", categoria: "Gomitas" },
    { id: 4,  nombre: "Chocolates M&M",              precio: 30.00, estado: "Bajo",   imageUrl: "https://www.elcastillodeldulce.mx/cdn/shop/files/CLTBAR068.png?v=1766164715&width=1214",                                                                     proveedor: "Dulceria El Payaso (Produlce)",    existencia: "12 pz",  pasillo: "C-01", fechaCaducidad: "03/2028", categoria: "Chocolates" },
    { id: 5,  nombre: "Bastones de Caramelo",        precio: 12.00, estado: "Optimo", imageUrl: "https://panchiscakes.com/wp-content/uploads/2021/10/BastonesRojos.png",                                                                                      proveedor: "Azucar Dulcerias",                existencia: "80 pz",  pasillo: "D-02", fechaCaducidad: "01/2029", categoria: "Gomitas" },
    { id: 6,  nombre: "Malvaviscos",                 precio: 10.50, estado: "Optimo", imageUrl: "https://bremen.com.mx/media/catalog/product/cache/610470214fddb7977fe391a45df41e50/5/0/5073.jpg",                                                            proveedor: "Tienda de la Rosa",               existencia: "300 pz", pasillo: "A-05", fechaCaducidad: "06/2027", categoria: "Gomitas" },
    { id: 7,  nombre: "Paletas de Cereza",           precio: 5.00,  estado: "Bajo",   imageUrl: "https://www.elcastillodeldulce.mx/cdn/shop/products/PALCAM227.png?v=1753996349&width=1214",                                                                  proveedor: "Dulceria Denny",                  existencia: "20 pz",  pasillo: "D-01", fechaCaducidad: "04/2027", categoria: "Gomitas" },
    { id: 8,  nombre: "Chicles de Bola",             precio: 8.00,  estado: "Optimo", imageUrl: "https://lamimigb.com/cdn/shop/products/0009.jpg?v=1676662287",                                                                                               proveedor: "Dulceria La Providencia",         existencia: "500 pz", pasillo: "E-03", fechaCaducidad: "08/2028", categoria: "Gomitas" },
    { id: 9,  nombre: "Huevitos de Chocolate",       precio: 22.00, estado: "Bajo",   imageUrl: "https://dulceriasvazquez.com/cdn/shop/files/240.png?v=1686845873",                                                                                           proveedor: "Dulcerias y Abarroteras Vazquez", existencia: "15 pz",  pasillo: "C-01", fechaCaducidad: "02/2027", categoria: "Chocolates" },
    { id: 10, nombre: "Caramelos Suaves",            precio: 14.00, estado: "Optimo", imageUrl: "https://dulcesdelarosa.com.mx/wp-content/uploads/dulces-de-la-rosa-caramelos-suaves-suavilocas.jpg",                                                         proveedor: "Dulceria El Payaso (Produlce)",    existencia: "140 pz", pasillo: "A-01", fechaCaducidad: "09/2028", categoria: "Gomitas" },
    { id: 11, nombre: "Trufas de Chocolate",         precio: 35.00, estado: "Bajo",   imageUrl: "https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750649500690L.jpg",                                                                     proveedor: "Azucar Dulcerias",                existencia: "8 pz",   pasillo: "C-03", fechaCaducidad: "11/2026", categoria: "Chocolates" },
    { id: 12, nombre: "Regaliz Rojo",                precio: 16.50, estado: "Optimo", imageUrl: "https://m.media-amazon.com/images/I/51fmTKUNOOL.jpg",                                                                                                        proveedor: "Tienda de la Rosa",               existencia: "95 pz",  pasillo: "D-03", fechaCaducidad: "07/2028", categoria: "Gomitas" },
    { id: 13, nombre: "Gomitas Aciditas",             precio: 19.00, estado: "Bajo",   imageUrl: "https://i5.walmartimages.com.mx/samsmx/images/product-images/img_large/980012759-1l.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF",                            proveedor: "Dulceria Denny",                  existencia: "30 pz",  pasillo: "B-04", fechaCaducidad: "05/2027", categoria: "Gomitas" },
    { id: 14, nombre: "Monedas de Chocolate",        precio: 11.00, estado: "Optimo", imageUrl: "https://comercialzazueta.com/cdn/shop/products/Monedas_mexico.jpg?v=1620240147",                                                                             proveedor: "Dulceria La Providencia",         existencia: "180 pz", pasillo: "C-02", fechaCaducidad: "12/2028", categoria: "Chocolates" },
    { id: 15, nombre: "Paletas de Caramelo",         precio: 7.50,  estado: "Optimo", imageUrl: "https://detqhtv6m6lzl.cloudfront.net/HCLContenido/producto/FullImage/7503030374552-1.jpg",                                                                   proveedor: "Dulcerias y Abarroteras Vazquez", existencia: "250 pz", pasillo: "D-01", fechaCaducidad: "04/2029", categoria: "Gomitas" },
    { id: 16, nombre: "Bebida Boing de Mango",       precio: 13.00, estado: "Optimo", imageUrl: "https://www.soriana.com/on/demandware.static/-/Sites-soriana-grocery-master-catalog/default/dwbfeefd45/images/product/0000075003104_A.jpg",                  proveedor: "Dulceria El Payaso (Produlce)",    existencia: "90 pz",  pasillo: "E-01", fechaCaducidad: "01/2027", categoria: "Bebidas" },
    { id: 17, nombre: "Refresco Coca Cola",          precio: 17.00, estado: "Optimo", imageUrl: "https://hebmx.vtexassets.com/arquivos/ids/575932/134557_image-1702357068.png?v=638497693764000000",                                                           proveedor: "Azucar Dulcerias",                existencia: "500 pz", pasillo: "E-01", fechaCaducidad: "06/2027", categoria: "Bebidas" },
    { id: 18, nombre: "Gatorade",                    precio: 14.50, estado: "Optimo", imageUrl: "https://farmaciasanjorge.com/cdn/shop/files/Imagenes_de_planograma__88e996de-19de-4fc5-8762-0b58fa46f640__07501022009529.1.jpg?v=1734650657&width=2000",      proveedor: "Tienda de la Rosa",               existencia: "120 pz", pasillo: "E-02", fechaCaducidad: "03/2027", categoria: "Bebidas" },
    { id: 19, nombre: "Importado Skittles Original", precio: 32.50, estado: "Bajo",   imageUrl: "https://m.media-amazon.com/images/I/71Oyuez1j9L._AC_UF894,1000_QL80_.jpg",                                                                                  proveedor: "Dulceria Denny",                  existencia: "25 pz",  pasillo: "F-01", fechaCaducidad: "09/2028", categoria: "Importados" },
    { id: 20, nombre: "Importado Nerds Candy Rope",  precio: 45.00, estado: "Optimo", imageUrl: "https://m.media-amazon.com/images/I/81ZeQ4VxJTL.jpg",                                                                                                        proveedor: "Dulceria La Providencia",         existencia: "60 pz",  pasillo: "F-02", fechaCaducidad: "11/2028", categoria: "Importados" },
    { id: 21, nombre: "Importado Hershey's Kisses",  precio: 38.00, estado: "Bajo",   imageUrl: "https://i5.walmartimages.com.mx/samsmx/images/product-images/img_large/981019154l.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF",                              proveedor: "Dulcerias y Abarroteras Vazquez", existencia: "18 pz",  pasillo: "C-02", fechaCaducidad: "05/2027", categoria: "Importados" }
];

async function insertarDatosIniciales() {
    const count = await Dulce.countDocuments();
    if (count === 0) {
        await Dulce.insertMany(dulcesIniciales);
        console.log('Datos iniciales insertados en MongoDB');
    } else {
        console.log(`BD ya tiene ${count} dulces, no se insertan duplicados`);
    }
}

mongoose.connection.once('open', () => {
    insertarDatosIniciales();
});

// ENDPOINTS - DULCES]

// GET obtener todos los dulces
app.get('/api/dulces', async (req, res) => {
    try {
        const dulces = await Dulce.find({}, { _id: 0, __v: 0 });
        res.json(dulces);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener dulces' });
    }
});

// GET obtener dulce por id
app.get('/api/dulces/:id', async (req, res) => {
    try {
        const dulce = await Dulce.findOne({ id: parseInt(req.params.id) }, { _id: 0, __v: 0 });
        if (dulce) res.json(dulce);
        else res.status(404).json({ error: 'Producto no encontrado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al buscar dulce' });
    }
});

// POST crear nuevo dulce
app.post('/api/dulces', async (req, res) => {
    try {
        const ultimo = await Dulce.findOne().sort({ id: -1 });
        const nuevoId = ultimo ? ultimo.id + 1 : 1;
        const dulce = new Dulce({ ...req.body, id: nuevoId });
        await dulce.save();
        const dulceRes = dulce.toObject();
        delete dulceRes._id;
        delete dulceRes.__v;
        res.status(201).json(dulceRes);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear dulce' });
    }
});

// PUT actualizar dulce (registra historial "Ajuste" si cambia existencia)
app.put('/api/dulces/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const dulceAnterior = await Dulce.findOne({ id });

        if (!dulceAnterior) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const existenciaAnterior = parsearExistencia(dulceAnterior.existencia);
        const existenciaNueva    = req.body.existencia !== undefined
            ? parsearExistencia(req.body.existencia)
            : existenciaAnterior;

        // Recalcular estado automáticamente si viene nueva existencia
        const updateData = { ...req.body };
        if (req.body.existencia !== undefined) {
            updateData.estado = calcularEstado(existenciaNueva);
        }

        const dulce = await Dulce.findOneAndUpdate(
            { id },
            updateData,
            { new: true, projection: { _id: 0, __v: 0 } }
        );

        // Registrar historial de Ajuste si cambió la existencia
        if (req.body.existencia !== undefined && existenciaNueva !== existenciaAnterior) {
            const diferencia = existenciaNueva - existenciaAnterior;
            await Historial.create({
                producto: dulce.nombre,
                accion:   'Ajuste',
                cantidad: `${existenciaNueva} pz`,
                fecha:    new Date().toLocaleDateString('es-MX')

            });
        }

        res.json(dulce);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar dulce' });
    }
});

// DELETE eliminar dulce
app.delete('/api/dulces/:id', async (req, res) => {
    try {
        const dulce = await Dulce.findOneAndDelete({ id: parseInt(req.params.id) });
        if (dulce) res.json({ mensaje: 'Dulce eliminado correctamente' });
        else res.status(404).json({ error: 'Producto no encontrado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar dulce' });
    }
});

// ENDPOINTS DE VENTAS

// POST /api/ventas → registrar venta: reduce existencia y guarda historial "Venta"
// Body: { dulceId: 5, cantidad: 3 }
app.post('/api/ventas', async (req, res) => {
    try {
        const { dulceId, cantidad } = req.body;

        if (!dulceId || !cantidad || cantidad <= 0) {
            return res.status(400).json({ error: 'Se requiere dulceId y cantidad válida' });
        }

        const dulce = await Dulce.findOne({ id: dulceId });
        if (!dulce) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const existenciaActual = parsearExistencia(dulce.existencia);
        if (existenciaActual < cantidad) {
            return res.status(400).json({
                error: `Existencia insuficiente. Disponible: ${existenciaActual}, solicitado: ${cantidad}`
            });
        }

        const nuevaExistencia = existenciaActual - cantidad;
        const nuevoEstado     = calcularEstado(nuevaExistencia);

        await Dulce.findOneAndUpdate(
            { id: dulceId },
            { existencia: formatearExistencia(nuevaExistencia), estado: nuevoEstado }
        );

        await Historial.create({
            producto: dulce.nombre,
            accion: 'Venta',
            cantidad: `-${cantidad} pz`,
            fecha: new Date().toLocaleDateString('es-MX')
        });

        res.json({
            mensaje:          'Venta registrada correctamente',
            producto:         dulce.nombre,
            cantidadVendida:  cantidad,
            existenciaActual: nuevaExistencia,
            estado:           nuevoEstado
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar venta' });
    }
});

// ENDPOINTS DE PEDIDOS (carrito)

// POST agregar producto al carrito global
// Body: { dulceId: 5, cantidad: 2 }
app.post('/api/pedidos/agregar', async (req, res) => {
    try {
        const { dulceId, cantidad } = req.body;

        if (!dulceId || !cantidad || cantidad <= 0) {
            return res.status(400).json({ error: 'Se requiere dulceId y cantidad válida' });
        }

        const dulce = await Dulce.findOne({ id: dulceId });
        if (!dulce) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Si ya existe en el carrito, suma cantidad
        const itemExistente = carritoGlobal.find(item => item.dulceId === dulceId);
        if (itemExistente) {
            itemExistente.cantidad += cantidad;
        } else {
            carritoGlobal.push({
                dulceId,
                nombre:    dulce.nombre,
                precio:    dulce.precio,
                cantidad,
                proveedor: dulce.proveedor || ''
            });
        }

        res.json({
            mensaje:  'Producto agregado al carrito',
            carrito:  carritoGlobal,
            total:    carritoGlobal.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al agregar al carrito' });
    }
});

// GET obtener carrito actual
app.get('/api/pedidos', (req, res) => {
    const total = carritoGlobal.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    res.json({ carrito: carritoGlobal, total });
});

// DELETE /api/pedidos/limpiar → limpiar el carrito
app.delete('/api/pedidos/limpiar', (req, res) => {
    carritoGlobal = [];
    res.json({ mensaje: 'Carrito limpiado correctamente' });
});

// ENDPOINTS DE COMPRAS

// POST suma existencia de los productos del carrito, registra historial "Surtido" y limpia el carrito
// El carrito se usa directamente
app.post('/api/compras/confirmar', async (req, res) => {
    try {
        if (carritoGlobal.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }

        const resultados = [];

        for (const item of carritoGlobal) {
            const dulce = await Dulce.findOne({ id: item.dulceId });
            if (!dulce) {
                resultados.push({ dulceId: item.dulceId, error: 'Producto no encontrado' });
                continue;
            }

            const existenciaActual = parsearExistencia(dulce.existencia);
            const nuevaExistencia  = existenciaActual + item.cantidad;
            const nuevoEstado      = calcularEstado(nuevaExistencia);

            await Dulce.findOneAndUpdate(
                { id: item.dulceId },
                { existencia: formatearExistencia(nuevaExistencia), estado: nuevoEstado }
            );

            await Historial.create({
                producto: dulce.nombre,
                accion: 'Surtido',
                cantidad: `+${item.cantidad} pz`,
                fecha: new Date().toLocaleDateString('es-MX')
            });

            resultados.push({
                producto: dulce.nombre,
                cantidadSurtida: item.cantidad,
                existenciaActual: nuevaExistencia,
                estado: nuevoEstado
            });
        }

        // Limpiar carrito después de confirmar
        carritoGlobal = [];

        res.json({
            mensaje:    'Compra confirmada y existencias actualizadas',
            resultados
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al confirmar compra' });
    }
});

// ENDPOINTS DE HISTORIAL

// GET los movimientos
app.get('/api/historial', async (req, res) => {
    try {
        const historial = await Historial.find({}, { _id: 0, __v: 0 }).sort({ fecha: -1 });
        res.json(historial);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

// GET filtrar por tipo: Venta, Surtido, Ajuste
app.get('/api/historial/:tipo', async (req, res) => {
    try {
        const tiposValidos = ['Venta', 'Surtido', 'Ajuste'];
        const tipo = req.params.tipo;

        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({ error: `Tipo inválido. Usa: ${tiposValidos.join(', ')}` });
        }

        const historial = await Historial.find({ accion: tipo }, { _id: 0, __v: 0 }).sort({ fecha: -1 });
        res.json(historial);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

// Servidor 
app.listen(PORT, () => {
    console.log(`Servidor de Candy House corriendo en: http://localhost:${PORT}`);
});
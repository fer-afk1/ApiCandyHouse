const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

const listaDulces = [
    { id: 1, nombre: "Gomitas de Ositos", precio: 15.00, estado: "Optimo", imageUrl: "https://dulcerialaestrella.com.mx/cdn/shop/files/IMG_1821_1200x.png?v=1770832581", proveedor: "Dulceria Denny", existencia: "150 pz", pasillo: "B-04", fechaCaducidad: "05/2028" },
    { id: 2, nombre: "Paleta Payaso", precio: 25.00, estado: "Bajo", imageUrl: "https://i5.walmartimages.com.mx/samsmx/images/product-images/img_large/980022677l.jpg", proveedor: "Dulceria La Providencia", existencia: "45 pz", pasillo: "A-02", fechaCaducidad: "10/2027" },
    { id: 3, nombre: "Gomitas de Aros", precio: 18.50, estado: "Optimo", imageUrl: "https://m.media-amazon.com/images/I/71wN8PXFmGL.jpg", proveedor: "Dulcerias y Abarroteras Vazquez", existencia: "200 pz", pasillo: "B-04", fechaCaducidad: "12/2027" },
    { id: 4, nombre: "Chocolates M&M", precio: 30.00, estado: "Bajo", imageUrl: "https://www.elcastillodeldulce.mx/cdn/shop/files/CLTBAR068.png?v=1766164715&width=1214", proveedor: "Dulceria El Payaso (Produlce)", existencia: "12 pz", pasillo: "C-01", fechaCaducidad: "03/2028" },
    { id: 5, nombre: "Bastones de Caramelo", precio: 12.00, estado: "Optimo", imageUrl: "https://panchiscakes.com/wp-content/uploads/2021/10/BastonesRojos.png", proveedor: "Azucar Dulcerias", existencia: "80 pz", pasillo: "D-02", fechaCaducidad: "01/2029" },
    { id: 6, nombre: "Malvaviscos", precio: 10.50, estado: "Optimo", imageUrl: "https://bremen.com.mx/media/catalog/product/cache/610470214fddb7977fe391a45df41e50/5/0/5073.jpg", proveedor: "Tienda de la Rosa", existencia: "300 pz", pasillo: "A-05", fechaCaducidad: "06/2027" },
    { id: 7, nombre: "Paletas de Cereza", precio: 5.00, estado: "Bajo", imageUrl: "https://www.elcastillodeldulce.mx/cdn/shop/products/PALCAM227.png?v=1753996349&width=1214", proveedor: "Dulceria Denny", existencia: "20 pz", pasillo: "D-01", fechaCaducidad: "04/2027" },
    { id: 8, nombre: "Chicles de Bola", precio: 8.00, estado: "Optimo", imageUrl: "https://lamimigb.com/cdn/shop/products/0009.jpg?v=1676662287", proveedor: "Dulceria La Providencia", existencia: "500 pz", pasillo: "E-03", fechaCaducidad: "08/2028" },
    { id: 9, nombre: "Huevitos de Chocolate", precio: 22.00, estado: "Bajo", imageUrl: "https://dulceriasvazquez.com/cdn/shop/files/240.png?v=1686845873", proveedor: "Dulcerias y Abarroteras Vazquez", existencia: "15 pz", pasillo: "C-01", fechaCaducidad: "02/2027" },
    { id: 10, nombre: "Caramelos Suaves", precio: 14.00, estado: "Optimo", imageUrl: "https://dulcesdelarosa.com.mx/wp-content/uploads/dulces-de-la-rosa-caramelos-suaves-suavilocas.jpg", proveedor: "Dulceria El Payaso (Produlce)", existencia: "140 pz", pasillo: "A-01", fechaCaducidad: "09/2028" },
    { id: 11, nombre: "Trufas de Chocolate", precio: 35.00, estado: "Bajo", imageUrl: "https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750649500690L.jpg", proveedor: "Azucar Dulcerias", existencia: "8 pz", pasillo: "C-03", fechaCaducidad: "11/2026" },
    { id: 12, nombre: "Regaliz Rojo", precio: 16.50, estado: "Optimo", imageUrl: "https://m.media-amazon.com/images/I/51fmTKUNOOL.jpg", proveedor: "Tienda de la Rosa", existencia: "95 pz", pasillo: "D-03", fechaCaducidad: "07/2028" },
    { id: 13, nombre: "Gomitas Aciditas", precio: 19.00, estado: "Bajo", imageUrl: "https://i5.walmartimages.com.mx/samsmx/images/product-images/img_large/980012759-1l.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF", proveedor: "Dulceria Denny", existencia: "30 pz", pasillo: "B-04", fechaCaducidad: "05/2027" },
    { id: 14, nombre: "Monedas de Chocolate", precio: 11.00, estado: "Optimo", imageUrl: "https://comercialzazueta.com/cdn/shop/products/Monedas_mexico.jpg?v=1620240147", proveedor: "Dulceria La Providencia", existencia: "180 pz", pasillo: "C-02", fechaCaducidad: "12/2028" },
    { id: 15, nombre: "Paletas de Caramelo", precio: 7.50, estado: "Optimo", imageUrl: "https://detqhtv6m6lzl.cloudfront.net/HCLContenido/producto/FullImage/7503030374552-1.jpg", proveedor: "Dulcerias y Abarroteras Vazquez", existencia: "250 pz", pasillo: "D-01", fechaCaducidad: "04/2029" },
    { id: 16, nombre: "Bebida Boing de Mango", precio: 13.00, estado: "Optimo", imageUrl: "https://www.soriana.com/on/demandware.static/-/Sites-soriana-grocery-master-catalog/default/dwbfeefd45/images/product/0000075003104_A.jpg", proveedor: "Dulceria El Payaso (Produlce)", existencia: "90 pz", pasillo: "E-01", fechaCaducidad: "01/2027" },
    { id: 17, nombre: "Refresco Coca Cola", precio: 17.00, estado: "Optimo", imageUrl: "https://hebmx.vtexassets.com/arquivos/ids/575932/134557_image-1702357068.png?v=638497693764000000", proveedor: "Azucar Dulcerias", existencia: "500 pz", pasillo: "E-01", fechaCaducidad: "06/2027" },
    { id: 18, nombre: "Gatorade", precio: 14.50, estado: "Optimo", imageUrl: "https://farmaciasanjorge.com/cdn/shop/files/Imagenes_de_planograma__88e996de-19de-4fc5-8762-0b58fa46f640__07501022009529.1.jpg?v=1734650657&width=2000", proveedor: "Tienda de la Rosa", existencia: "120 pz", pasillo: "E-02", fechaCaducidad: "03/2027" },
    { id: 19, nombre: "Importado Skittles Original", precio: 32.50, estado: "Bajo", imageUrl: "https://m.media-amazon.com/images/I/71Oyuez1j9L._AC_UF894,1000_QL80_.jpg", proveedor: "Dulceria Denny", existencia: "25 pz", pasillo: "F-01", fechaCaducidad: "09/2028" },
    { id: 20, nombre: "Importado Nerds Candy Rope", precio: 45.00, estado: "Optimo", imageUrl: "https://m.media-amazon.com/images/I/81ZeQ4VxJTL.jpg", proveedor: "Dulceria La Providencia", existencia: "60 pz", pasillo: "F-02", fechaCaducidad: "11/2028" },
    { id: 21, nombre: "Importado Hershey's Kisses", precio: 38.00, estado: "Bajo", imageUrl: "https://i5.walmartimages.com.mx/samsmx/images/product-images/img_large/981019154l.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF", proveedor: "Dulcerias y Abarroteras Vazquez", existencia: "18 pz", pasillo: "C-02", fechaCaducidad: "05/2027" }
];

app.get('/api/dulces', (req, res) => { res.json(listaDulces); });

app.get('/api/dulces/:id', (req, res) => {
    const idBuscado = parseInt(req.params.id);
    const dulce = listaDulces.find(d => d.id === idBuscado);
    if (dulce) res.json(dulce);
    else res.json({ error: "Producto no encontrado" });
});

app.listen(PORT, () => { console.log(`Servidor de Candy House corriendo en: http://localhost:${PORT}`); });
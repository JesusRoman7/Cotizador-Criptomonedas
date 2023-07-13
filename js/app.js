const monedasSelect = document.querySelector('#moneda');
const criptomonedasSelect = document.querySelector('#criptomonedas');
const formulario = document.querySelector('#formulario');
const resultado = document.querySelector('#resultado');

const objBusqueda = {
    moneda: '',
    criptomoneda: ''
}

//Crear un Promise
//Este promise es para ver que se han descargado todas las criptomonedas
//ese resolve() va a almacenar el resultado de este promise (siempre y cuando sea correcto) si el Promise falla, se debe almacenar en //un reject() pero en este caso solo colocamos el resolve, ESO NOS DEJA LA VARIABLE CRIPTOMONEDAS DISPONIBLE PARA EL SIGUIENTE .THEN que tenemos en el fetch
const obtenerCriptomonedas = criptomonedas => {
    return new Promise(resolve=>{
        resolve(criptomonedas); //este resolve con criptomonedas(lo que tiene criptomonedas) esta disponible para el siguiente THEN
    })
}

document.addEventListener('DOMContentLoaded', ()=>{
    consultarCriptomonedas(); //para llenar el select
    formulario.addEventListener('submit', submitFormulario); //evento por submit
    monedasSelect.addEventListener('change', leerValor); //evento para leer moneda
    criptomonedasSelect.addEventListener('change', leerValor); //evento para leer criptomoneda
})

function consultarCriptomonedas(){
    const url = 'https://min-api.cryptocompare.com/data/top/mktcapfull?limit=10&tsym=USD';

    fetch(url)
        .then(respuesta => respuesta.json())
        //.then(resultado => console.log(resultado.Data)) //con ese resultado.Data accedemos al objeto que tiene las criptos
        //En el codigo de abajo siempre se recomienda retornar una promesa en las operaciones asíncronas para extender funcionalidad, creó otra promesa para poder encadenar otro .then y trabajar más comodo
        //ESTO SERA UN PROMISE
        .then(resultado => obtenerCriptomonedas(resultado.Data)) //el codigo esta arriba(linea 13/14 aprox)
        .then(criptomonedas => selectCriptomonedas(criptomonedas))
}

//Itera e Inyecta en el HTML las criptomonedas
function selectCriptomonedas(criptomonedas){
    //Criptomonedas va a ser un arreglo, entonces podemos ir iterando
    console.log(criptomonedas);
    criptomonedas.forEach(cripto => {
        console.log(cripto.CoinInfo);
        const {FullName, Name} = cripto.CoinInfo;
        const nuevaOpcion = document.createElement('option');
        nuevaOpcion.textContent = FullName;
        nuevaOpcion.value = Name;

        criptomonedasSelect.appendChild(nuevaOpcion);
    });
}

//Valor que se le agrega al objeto
function leerValor(e){
    //En el SELECT
    objBusqueda[e.target.name] = e.target.value; //el e.target.value apunta a lo que seleccionemos al parecer, entonces
    //las propiedades computadas de los objetos tambien aplican en los select
    console.log(objBusqueda);
}

function submitFormulario(e){
    e.preventDefault();
    //Validar
    const {moneda, criptomoneda} = objBusqueda; //extraemos los valores del objeto
    if(moneda ==='' || criptomoneda === ''){
        mostrarAlerta('Ambos campos son obligatoios');
        return;
    }

    //Consultar la API con los resultados
    consultarAPI();
}

function consultarAPI(){
    //Ahora, OJO AQUI, apenas comprendimos bien el significado de DESTRUCTURING
    //DESTRUCTURING ES EXTRAER EL VALOR Y CREAR LA VARIABLE EN UN MISMO PASO
    //Una vez mas, EXTRA EL VALOR Y CREA LA VARIABLE, tenemos un KEY-VALUE en una misma palabra
    console.log(objBusqueda);
    const  {moneda, criptomoneda} = objBusqueda;
    console.log(criptomoneda); //BTC por ejemplo, ira cambiando dependiendo de nuestro objeto global
    console.log(moneda); //MXN por ejemplo
    const url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${criptomoneda}&tsyms=${moneda}`;

    mostrarSpinner();

    setTimeout(()=>{
        fetch(url)
        .then(respuesta => respuesta.json())
        .then(cotizacion => {
            console.log(cotizacion);
            //Tenemos que entrar a las propiedades del objeto de forma dinamica, porque cada respuesta de la api va a ser diferente
            //Accedemos al objeto.display.btc.mxn(por ejemplo)
            //Por ejemplo objeto.display.eth.mxn otro ejemplo
            //Vemos como va variando dependiendo de lo que elegimos
            //Con esa sintaxis accedemos a un objeto dentro de otro Objeto de forma dinamica
            //Conclusion: se crea una variable de manera dinamica []
            mostrarCotizacionHTML(cotizacion.DISPLAY[criptomoneda][moneda]);
        })
    },3000)
}

function mostrarCotizacionHTML(cotizacion){
    console.log(cotizacion);
    limpiarHTML();
    const {PRICE, HIGHDAY, LOWDAY, CHANGEPCT24HOUR, LASTUPDATE} = cotizacion;

    const precio = document.createElement('p');
    precio.classList.add('precio'); //clase para hacer mas grande el font size
    precio.innerHTML = `
    El Precio es: <span> ${PRICE} </span>
    `;

    const precioAlto = document.createElement('p');
    precioAlto.innerHTML = `Precio mas alto del dia: <span>${HIGHDAY}</span>`;
    
    const precioBajo = document.createElement('p');
    precioBajo.innerHTML = `Precio mas bajo del dia: <span>${LOWDAY}</span>`;
    
    const ultimasHoras = document.createElement('p');
    ultimasHoras.innerHTML = `Variacion ultimas 24 horas: <span>${CHANGEPCT24HOUR}</span>`;
    
    const ultimaActualizacion = document.createElement('p');
    ultimaActualizacion.innerHTML = `Ultima Actualizacion: <span>${LASTUPDATE}</span>`;

    resultado.appendChild(precio);
    resultado.appendChild(precioAlto);
    resultado.appendChild(precioBajo);
    resultado.appendChild(ultimasHoras);
    resultado.appendChild(ultimaActualizacion);
    
}

function mostrarAlerta(msg){
    console.log(msg);
    const existeAlerta = document.querySelector('.error');
    if(!existeAlerta){
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('error');
        divMensaje.textContent = msg;
    
        formulario.appendChild(divMensaje);

        setTimeout(()=>{
            divMensaje.remove();
        },3000)
    }
}

function limpiarHTML(){
    while(resultado.firstChild){
        resultado.removeChild(resultado.firstChild);
    }
}

function mostrarSpinner(){
    limpiarHTML();

    const spinner = document.createElement('div');
    spinner.classList.add('spinner'); //la clase del documento
    spinner.innerHTML =  `
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
    `

    resultado.appendChild(spinner);
}
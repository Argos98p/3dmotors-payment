import './App.css';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useEffect, useState} from "react";

import Lottie from "lottie-react";
import failedAnimation from "./assets/lottie_animations/failed_payment.json";
import successAnimation from "./assets/lottie_animations/successfully_payment.json";
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

import forge from 'node-forge';




const style = {"color": "blue" ,"layout":"vertical"};

function App() {



    const [paymentStatus, setPaymentStatus] = useState(3);
    /*
     0:failed
     1:acepeted
     3:inprocess
     */


     const [queryParameters] = useSearchParams();
     const [price, setPrice] = useState(0);
     const [usuarioId, setUsuarioId] = useState(0);


     useEffect(() => {
        const fetch = async () => {
            
            const userId = queryParameters.get("idusuario");
            console.log(userId);
                


            setUsuarioId(userId);

            try {
              const { data } = await axios.get(`https://3dmotores.com/objects/getvaluetopay?idusuario=${userId}&app=vehiculos`);
              setPrice(data)

            } catch (err) {
              console.error(err);
            }
          };
          fetch();    
     }, [])
     


    function createOrder() {
        // replace this url with your server
        return fetch(`https://3dmotores.com/objects/orders?value=${price}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // use the "body" param to optionally pass additional order information
            // like product ids and quantities
            body: JSON.stringify({
                cart: [
                    {
                        sku: "1blwyeo8",
                        quantity: 2,
                    },
                ],
            }),
        })
            .then((response) => response.json())
            .then((order) => {
                // Your code here after create the order
                return order.id;
            });
    }
    function onError(data){
        setPaymentStatus();
        console.log(data)
    }
    async function  onApprove (data) {
        try {

            const response =  await axios.post(`https://3dmotores.com/objects/orders/capture?orderid=${data.orderID}`,JSON.stringify({
                orderID: data.orderID,
            }),);

            if(response.status){
                const response = await axios.post(`https://3dmotores.com/objects/orders/verify?orderid=${data.orderID}&idusuario=${usuarioId}&app=vehiculos`);
                if (response.status === 200) {
                    setPaymentStatus(1);
                    // Aquí puedes realizar acciones adicionales si es necesario
                }
            }            
        } catch (error) {
            
        }
        

        

    }

// Custom component to wrap the PayPalButtons and show loading spinner
    const ButtonWrapper = ({ showSpinner }) => {
        const [{ isPending }] = usePayPalScriptReducer();
        return (
            <>
                { (showSpinner && isPending) && <div className="spinner" /> }
                <PayPalButtons
                    onError={onError}
                    style={style}
                    disabled={undefined}
                    forceReRender={[style]}
                    fundingSource={undefined}
                    createOrder={createOrder}
                    onApprove={onApprove}
                />
            </>
        );
    }

    const infoProduct= ()=>{
        return <div className='infoProduct'>
            <img src='/payment/auto.jpeg' alt="logo"/>
            <div className='info'>
                <h3>Vehiculo con logo</h3>
                <p>$9.66</p>
            </div>
        </div>
    }


    return (
      <div className={"paypal-container"}>
          <div>

            <div className='logo-image'>
                <img src='/payment/logo.png' alt='logo'/> 
            </div>

                {infoProduct()}

              {
                  paymentStatus === 3 && <PayPalScriptProvider  options={{ clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID, components: "buttons", currency: "USD" }}>
                      <ButtonWrapper   style={{width:"600px"}} showSpinner={true} />
                  </PayPalScriptProvider>
              }

              {
                  paymentStatus === 1 &&
                  <>
                      <Lottie animationData={successAnimation} loop={true} />
                      <h2>Compra existosa, puede regresar a la aplicación</h2>
                                 
                  </>
              }
              {
                  paymentStatus === 0 && 
                  <>
                        <Lottie animationData={failedAnimation} loop={true} />
                        <h2>Erorr en el pago</h2>     
                        
                  </>
                  
                  
              }

          </div>

      </div>
    );
}
export default App;

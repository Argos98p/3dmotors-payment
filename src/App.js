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
     const [objetoId, setObjetoId] = useState(0);
     const [paymentType, setPaymentType] = useState('single');

     useEffect(() => {
        const fetch = async () => {
            
            const userId = queryParameters.get("idusuario");
            const objetoId= queryParameters.get("idobjeto");
            const payType= queryParameters.get("paymenttype");
        
            console.log(payType);
        
            setObjetoId(objetoId);
            setUsuarioId(userId);
            
            if(payType){
                setPaymentType(payType);
            }
            
            if(payType === 'subscription'){
                setPrice(16);
                return
            }

            try {
              const response = await axios.get(`https://3dmotores.com/pagos/getvaluetopay?idusuario=${userId}&app=vehiculos&idobjeto=${objetoId}`);
              setPrice(response.data);
              console.log(response.data);

            } catch (err) {
              console.error(err);
            }
          };
          fetch();    
     }, [])
     


    function createOrder() {
        // replace this url with your server
        return fetch(`https://3dmotores.com/pagos/orders?value=${price}`, {
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
    async function  onApproveSingle (data) {

        console.log(data);
        try {

            const response =  await axios.post(`https://3dmotores.com/pagos/orders/capture?orderid=${data.orderID}`,JSON.stringify({
                orderID: data.orderID,
            }),);

            if(response.status){
                const response = await axios.post(`https://3dmotores.com/pagos/orders/verify?orderid=${data.orderID}&idusuario=${usuarioId}&app=vehiculos&idobjeto=${objetoId}`);
                console.log(response);
                if (response.status === 200) {
                    setPaymentStatus(1);
                    // Aquí puedes realizar acciones adicionales si es necesario
                }
            }            
        } catch (error) {
            
        }
        

        

    }

    async function  onApproveSubscription(data) {

        console.log(data);
        setPaymentStatus(1);
        // try {

        //     const response =  await axios.post(`https://3dmotores.com/pagos/orders/capture?orderid=${data.orderID}`,JSON.stringify({
        //         orderID: data.orderID,
        //     }),);

        //     if(response.status){
        //         const response = await axios.post(`https://3dmotores.com/pagos/orders/verify?orderid=${data.orderID}&idusuario=${usuarioId}&app=vehiculos&idobjeto=${objetoId}`);
        //         console.log(response);
        //         if (response.status === 200) {
        //             setPaymentStatus(1);
        //             // Aquí puedes realizar acciones adicionales si es necesario
        //         }
        //     }            
        // } catch (error) {
            
        // }

    }
    const ButtonWrapperSub = ({ type }) => {
        const [{ options }, dispatch] = usePayPalScriptReducer();

        useEffect(() => {
            dispatch({
                type: "resetOptions",
                value: {
                    ...options,
                    intent: "subscription",
                },
            });
        }, [type]);

        return (<PayPalButtons
            createSubscription={(data, actions) => {
                console.log(data)
                return actions.subscription
                    .create({
                        plan_id: "P-2PW54772A1930384PMUPONSA",
                    })
                    .then((subscriptionId) => {
                        // Your code here after create the order
                        console.log(subscriptionId);
                        return subscriptionId;
                    });
            }}
            style={{
                label: "subscribe",
            }}
            onApprove={onApproveSubscription}
            onError={(err)=>{

                console.log(err)
            }}
        />);
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
                    onApprove={onApproveSingle}
                />

            </>
        );
    }

    const infoProduct= ()=>{
        return <div className='infoProduct'>
            <img src='/payment/auto.jpeg' alt="logo"/>
            <div className='info'>
                {
                    (price>7.00)?<h3>Vehiculo con logo</h3>:<h3>Vehiculo </h3>
                }
                
                <p>${`${price}`}</p>
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
                  (paymentStatus === 3 && paymentType === 'single') && <PayPalScriptProvider  options={{ clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID, components: "buttons", currency: "USD" }}>
                      <ButtonWrapper   style={{width:"600px"}} showSpinner={true} />
                  </PayPalScriptProvider>
              }

              {
                  (paymentStatus === 3 && paymentType === 'subscription') && <PayPalScriptProvider  options={{ clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID, components: "buttons", currency: "USD" , vault:true}}>
                      <ButtonWrapperSub   style={{width:"600px"}} type='subscription' />
                  </PayPalScriptProvider>
              }

              {
                  paymentStatus === 1 &&
                  <>
                      <Lottie animationData={successAnimation} loop={true} />
                      <h2 className='blanco'>Compra existosa, puede regresar a la aplicación</h2>
                                 
                  </>
              }
              {
                  paymentStatus === 0 && 
                  <>
                        <Lottie animationData={failedAnimation} loop={true} />
                        <h2 className='blanco'>Erorr en el pago</h2>     
                        
                  </>
                  
                  
              }

          </div>

      </div>
    );
}
export default App;

import './App.css';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useState} from "react";

import Lottie from "lottie-react";
import failedAnimation from "./assets/lottie_animations/failed_payment.json";
import successAnimation from "./assets/lottie_animations/successfully_payment.json";

const style = {"color": "blue" ,"layout":"vertical"};

function App() {

    const [paymentStatus, setPaymentStatus] = useState(3);
    /*
     0:failed
     1:acepeted
     3:inprocess
     */

    function createOrder() {
        // replace this url with your server
        return fetch("https://3dmotores.com/objects/orders?value=1.1", {
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
        setPaymentStatus(0);
        console.log(data)
    }
    function onApprove(data) {
        // replace this url with your server

        return fetch(`https://3dmotores.com/objects/orders/capture?orderid=${data.orderID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orderID: data.orderID,
            }),
        })
            .then((response) => response.json())
            .then((orderData) => {
                console.log(orderData)
                setPaymentStatus(1);
            });
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


    return (
      <div className={"paypal-container"}>
          <div>
              {
                  paymentStatus === 3 && <PayPalScriptProvider options={{ clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID, components: "buttons", currency: "USD" }}>
                      <ButtonWrapper showSpinner={true} />
                  </PayPalScriptProvider>
              }

              {
                  paymentStatus === 1 &&
                  <Lottie animationData={successAnimation} loop={true} />
              }
              {
                  paymentStatus === 0 && <Lottie animationData={failedAnimation} loop={true} />
              }

          </div>

      </div>
    );
}
export default App;

import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function ProductCard(props){
    const{ name, origin, price, description }= props;

    const qrData= JSON.stringify({
        product: name,
        origin: origin,
        price: price,
        description: description
    });

    return(
        <div style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            margin: "10px",
            width: "250px",
            backgroundColor: "#fff",
            boxShadow: "0px 2px 5px rgba(0,0,0,0.1)"
        }}>
            <h3>{name}</h3>
            <p><strong>Origin:</strong> {origin}</p>
            <p><strong>Price:</strong> Ksh{price}</p>
            <p>{description}</p>

            {/* QR Code section */}
            <div style={{ textAlign: "center", marginTop: "10px" }}>
                <QRCodeCanvas value={qrData} size={100} />
                <p style={{ fontSize: "12px", color: "#555" }}>Scan for details</p>
            </div>

        </div>
    );
}
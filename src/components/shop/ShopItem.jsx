import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icons } from "../../utils";
import "./ShopItem.css";

const ShopItem = ({ quantity, discount, price, requestPayment }) => {
    return (
        <div className="shop-item" onClick={() => requestPayment(quantity, price)}>
            <div className="shop-item__quantity">
                <FontAwesomeIcon icon={icons.faMusic} />
                {quantity}
            </div>
            <div className="shop-item__price">
                <div className="shop-item__discount">
                    {discount ? `${discount}% 할인` : ""}
                </div>
                <div className="shop-item__price-text">
                    {`₩ ${price.toLocaleString()}`}
                </div>
            </div>
        </div>
    );
};

export default ShopItem;
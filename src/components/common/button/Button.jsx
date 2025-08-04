import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Button.css";

const Button = ({ text, icon, type, onClick }) => {
    return (
        <button className={["button", type && `button--${type}`].join(" ")} onClick={onClick}>
            {icon && <FontAwesomeIcon icon={icon} />}
            <span>{text}</span>
        </button>
    );
};

export default Button;

import '../styles/components/Button.css';

export default function Button({ nombre, onClick }: { nombre: string, onClick?: () => void }) {
    if (nombre === "Menu") {
        return <button className="StylesButtonReturn" onClick={onClick}>{nombre}</button>;
    }   
    else {
    return <button className="StylesButton" onClick={onClick}>{nombre}</button>;
    }
}
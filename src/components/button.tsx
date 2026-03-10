import '../styles/buttonstyles.css';

export default function Button({ nombre }: { nombre: string }) {
    if (nombre === "Menu") {
        return <button className="StylesButtonReturn">{nombre}</button>;
    }   
    else {
    return <button className="StylesButton">{nombre}</button>;
    }
}
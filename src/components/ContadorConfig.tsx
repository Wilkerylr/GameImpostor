import '../styles/components/ContadorConfig.css';

interface Props {
    label: string;
    valor: number;
    min: number;
    max: number;
    onChange: (valor: number) => void;
    error?: string;
}

export default function ContadorConfig({ label, valor, min, max, onChange, error }: Props) {
    return (
        <div className="contador-config">
            <span className="contador-label">{label}</span>
            <div className="contador-controles">
                <button className="contador-btn" onClick={() => onChange(valor - 1)} disabled={valor <= min}>−</button>
                <span className="contador-valor">{valor}</span>
                <button className="contador-btn" onClick={() => onChange(valor + 1)} disabled={valor >= max}>+</button>
            </div>
            {error && <p className="contador-error">{error}</p>}
        </div>
    );
}

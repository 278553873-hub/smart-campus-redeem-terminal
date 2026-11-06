import microphoneArtwork from '../../assets/airec/microphone-pairing-v1.png';
import './airecDevice.css';

export default function AirecDeviceArtwork({ scanning = false, compact = false, size }: { scanning?: boolean; compact?: boolean; size?: 'device' }) {
    return <div className={`airec-artwork ${size === 'device' ? 'airec-artwork-device' : compact ? 'airec-artwork-compact' : ''} ${scanning ? 'is-scanning' : ''}`} aria-hidden="true">
        {!compact && !size && <svg viewBox="0 0 224 224" className="airec-scan-rings">
            <circle cx="112" cy="112" r="110" vectorEffect="non-scaling-stroke" className="airec-scan-ring airec-scan-ring-one" />
            <circle cx="112" cy="112" r="110" vectorEffect="non-scaling-stroke" className="airec-scan-ring airec-scan-ring-two" />
            <circle cx="112" cy="112" r="110" vectorEffect="non-scaling-stroke" className="airec-scan-ring airec-scan-ring-three" />
        </svg>}
        <img src={microphoneArtwork} alt="" draggable={false} width={1254} height={1254} className="airec-microphone-art" />
    </div>;
}

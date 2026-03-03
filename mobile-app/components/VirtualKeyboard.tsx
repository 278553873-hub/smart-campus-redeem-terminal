import React from 'react';

interface VirtualKeyboardProps {
    onClose: () => void;
    onKeyPress: (key: string) => void;
    onDelete: () => void;
    onSubmit: () => void;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onClose, onKeyPress, onDelete, onSubmit }) => {
    const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
    const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

    return (
        <div className="absolute bottom-0 left-0 right-0 h-[280px] bg-[#D1D5DB] pb-safe z-50 flex flex-col p-2 gap-2 animate-in slide-in-from-bottom duration-300 pointer-events-auto">
            <div className="flex justify-center gap-1.5 w-full">
                {row1.map(key => (
                    <button key={key} onClick={() => onKeyPress(key.toLowerCase())} className="flex-1 h-11 bg-white rounded-lg shadow-sm text-black font-medium text-xl active:bg-gray-300 transition-colors">
                        {key}
                    </button>
                ))}
            </div>
            <div className="flex justify-center gap-1.5 w-full px-4">
                {row2.map(key => (
                    <button key={key} onClick={() => onKeyPress(key.toLowerCase())} className="flex-1 h-11 bg-white rounded-lg shadow-sm text-black font-medium text-xl active:bg-gray-300 transition-colors">
                        {key}
                    </button>
                ))}
            </div>
            <div className="flex justify-center gap-1.5 w-full">
                <button className="flex-[1.5] h-11 bg-[#BFC3CE] rounded-lg shadow-sm flex items-center justify-center active:bg-gray-400">
                    <svg width="18" height="20" viewBox="0 0 16 18" fill="black"><path d="M8 0L0 8H4V18H12V8H16L8 0Z" /></svg>
                </button>
                {row3.map(key => (
                    <button key={key} onClick={() => onKeyPress(key.toLowerCase())} className="flex-1 h-11 bg-white rounded-lg shadow-sm text-black font-medium text-xl active:bg-gray-300 transition-colors">
                        {key}
                    </button>
                ))}
                <button onClick={onDelete} className="flex-[1.5] h-11 bg-[#BFC3CE] rounded-lg shadow-sm flex items-center justify-center active:bg-gray-400">
                    <svg width="24" height="18" viewBox="0 0 24 18" fill="black"><path d="M8.5 0C8.1 0 7.7 0.2 7.4 0.5L0.5 8C0.2 8.3 0 8.6 0 9C0 9.4 0.2 9.7 0.5 10L7.4 17.5C7.7 17.8 8.1 18 8.5 18H22C23.1 18 24 17.1 24 16V2C24 0.9 23.1 0 22 0H8.5ZM13 13.6L16 10.6L19 13.6L20.4 12.2L17.4 9.2L20.4 6.2L19 4.8L16 7.8L13 4.8L11.6 6.2L14.6 9.2L11.6 12.2L13 13.6Z" /></svg>
                </button>
            </div>
            <div className="flex justify-center gap-1.5 w-full">
                <button onClick={onClose} className="flex-[2] h-11 bg-[#BFC3CE] rounded-lg shadow-sm text-black font-medium text-base active:bg-gray-400">
                    123
                </button>
                <button className="flex-[2] h-11 bg-[#BFC3CE] rounded-lg shadow-sm flex items-center justify-center active:bg-gray-400">
                    🌐
                </button>
                <button onClick={() => onKeyPress(' ')} className="flex-[6] h-11 bg-white rounded-lg shadow-sm text-black font-medium text-xl active:bg-gray-300">
                    space
                </button>
                <button onClick={onSubmit} className="flex-[3] h-11 bg-blue-500 rounded-lg shadow-sm text-white font-medium text-base active:bg-blue-600">
                    发送
                </button>
            </div>
        </div>
    );
};

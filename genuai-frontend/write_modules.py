import os

files = {}

files['src/pages/Module1_ProfileResume.tsx'] = r"""
import { useState, useRef } from 'react';
const API = import.meta.env.VITE_API_URL;
interface Props { user: any; onComplete: (data: any) => void; }
export default function Module1_ProfileResume({ user, onComplete }: Props) {
  return <div>M1</div>;
}
""".lstrip()

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write(content)
    print(f'Written: {path} ({len(content)} bytes)')

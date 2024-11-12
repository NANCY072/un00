document.addEventListener('DOMContentLoaded', function() {
    const baseColorInput = document.getElementById('baseColor');
    const schemeTypeSelect = document.getElementById('schemeType');
    const generateBtn = document.getElementById('generateBtn');
    const colorPalette = document.getElementById('colorPalette');

    // 修改配色方案選項的順序
    const schemeOptions = [
        { value: 'monochromatic', label: '單色系' },
        { value: 'analogous', label: '類似色' },
        { value: 'complementary', label: '互補色' },
        { value: 'contrast', label: '對比色' },
        { value: 'triadic', label: '三角配色' },
        { value: 'split-complementary', label: '明度變化' },
        { value: 'square', label: '方形配色' },
        { value: 'compound', label: '複合配色' },
        { value: 'shades', label: '分裂互補色' },
        { value: 'trending', label: '最近流行色' }
    ];

    // 更新選項列表
    schemeTypeSelect.innerHTML = schemeOptions
        .map(option => `<option value="${option.value}">${option.label}</option>`)
        .join('');

    // 生成配色方案
    function generateColorScheme(baseColor, schemeType) {
        const colors = [];
        const hsl = hexToHSL(baseColor);
        
        colors.push(baseColor);

        switch(schemeType) {
            case 'analogous':
                // 類似色：更多的相鄰顏色
                [-60, -50, -40, -30, -20, -10, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130].forEach(angle => {
                    colors.push(hslToHex((hsl.h + angle + 360) % 360, hsl.s, hsl.l));
                });
                break;

            case 'monochromatic':
                // 單色系：按照明度從高到低排序
                const monoColors = [];
                const steps = 20; // 生成20個色階
                
                for (let i = 0; i < steps; i++) {
                    // 從最亮到最暗的漸變
                    const lightness = 95 - (i * (90 / (steps - 1))); // 從95%降到5%
                    const saturation = hsl.s; // 保持原始飽和度
                    monoColors.push(hslToHex(hsl.h, saturation, lightness));
                }
                
                // 將生成的顏色添加到結果中
                colors.push(...monoColors);
                break;

            case 'complementary':
                // 互補色：添加更多過渡色
                const comp = (hsl.h + 180) % 360;
                colors.push(hslToHex(comp, hsl.s, hsl.l));
                // 添加原色的變體
                [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].forEach(factor => {
                    colors.push(hslToHex(hsl.h, hsl.s * factor, hsl.l));
                });
                // 添加互補色的變體
                [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].forEach(factor => {
                    colors.push(hslToHex(comp, hsl.s * factor, hsl.l));
                });
                break;

            case 'triadic':
                // 三角配色：添加更多變化
                const triad1 = (hsl.h + 120) % 360;
                const triad2 = (hsl.h + 240) % 360;
                // 每個主色的變體
                [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].forEach(factor => {
                    colors.push(hslToHex(hsl.h, hsl.s * factor, hsl.l));
                    colors.push(hslToHex(triad1, hsl.s * factor, hsl.l));
                    colors.push(hslToHex(triad2, hsl.s * factor, hsl.l));
                });
                break;

            case 'contrast':
                // 對比色：更豐富的對比變化
                const contrastHue = (hsl.h + 180) % 360;
                // 原色系列
                [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].forEach(factor => {
                    colors.push(hslToHex(hsl.h, hsl.s, hsl.l * factor));
                });
                // 對比色系列
                [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].forEach(factor => {
                    colors.push(hslToHex(contrastHue, hsl.s, hsl.l * factor));
                });
                break;

            case 'split-complementary':
                // 分裂互補色：添加更多變化
                const compHue = (hsl.h + 180) % 360;
                const split1 = (compHue - 30) % 360;
                const split2 = (compHue + 30) % 360;
                
                [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].forEach(factor => {
                    colors.push(hslToHex(hsl.h, hsl.s * factor, hsl.l));
                    colors.push(hslToHex(split1, hsl.s * factor, hsl.l));
                    colors.push(hslToHex(split2, hsl.s * factor, hsl.l));
                });
                break;

            case 'shades':
                // 明度變化：從最亮到最暗
                const baseHSL = hexToHSL(baseColor);
                // 保持色相和飽和度不變，只改變明度
                for (let i = 0; i < 20; i++) {
                    // 從 90% 明度開始，每次遞減約 4.5%，直到 5% 明度
                    const lightness = Math.max(90 - (i * 4.5), 5);
                    // 保持原始色相和飽和度，只改變明度
                    colors.push(hslToHex(baseHSL.h, baseHSL.s, lightness));
                }
                break;
        }
        
        // 使用新的排序函數
        const uniqueColors = [...new Set(colors)];
        return sortColorsByHue(uniqueColors);
    }

    // 修改排序函數
    function sortColorsByHue(colors) {
        // 先將顏色轉換為小寫並去重
        const uniqueColors = [...new Set(colors.map(color => color.toLowerCase()))];
        
        // 將顏色轉換為 HSL 並排序
        return uniqueColors.sort((a, b) => {
            const hslA = hexToHSL(a);
            const hslB = hexToHSL(b);
            
            // 如果色相相同（單色系的情況）
            if (Math.abs(hslA.h - hslB.h) < 1) {
                // 按明度從高到低排序
                return hslB.l - hslA.l;
            }
            
            // 其他情況按原來的邏輯排序
            if (Math.abs(hslA.h - hslB.h) > 10) {
                return hslA.h - hslB.h;
            }
            if (Math.abs(hslA.s - hslB.s) > 5) {
                return hslB.s - hslA.s;
            }
            return hslB.l - hslA.l;
        });
    }

    // 顏色轉換輔助函數
    function hexToHSL(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }

        return { h, s: s * 100, l: l * 100 };
    }

    function hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    // 創建顏色展示框
    function createColorBox(color) {
        const box = document.createElement('div');
        box.className = 'color-box';
        box.style.backgroundColor = color;
        
        const colorCode = document.createElement('div');
        colorCode.className = 'color-code';
        colorCode.textContent = color.toUpperCase();
        
        box.appendChild(colorCode);
        
        // 點擊事件處理
        box.addEventListener('click', (e) => {
            e.preventDefault();
            const preview = document.querySelector('.text-preview');
            const textIndicator = document.querySelector('.text-color-indicator');
            const bgIndicator = document.querySelector('.bg-color-indicator');

            if (e.shiftKey) {
                // 更新背景色
                preview.style.backgroundColor = color;
                bgIndicator.style.backgroundColor = color;
                bgIndicator.dataset.color = color;
                
                if (!preview.style.color) {
                    const isLight = isLightColor(color);
                    preview.style.color = isLight ? '#333' : '#fff';
                }
            } else {
                // 更新文字顏色
                preview.style.color = color;
                textIndicator.style.backgroundColor = color;
                textIndicator.dataset.color = color;
            }
        });
        
        return box;
    }

    // 生成按鈕點擊事件
    generateBtn.addEventListener('click', () => {
        const baseColor = baseColorInput.value;
        const schemeType = schemeTypeSelect.value;
        
        const colors = generateColorScheme(baseColor, schemeType);
        
        // 清空現有的調色板
        colorPalette.innerHTML = '';
        
        // 添加所有生成的顏色
        colors.forEach(color => {
            colorPalette.appendChild(createColorBox(color));
        });
        
        // 更新預覽組件
        updatePreviewComponents(colors);
    });

    // 更新預覽組件函數
    function updatePreviewComponents(colors) {
        const preview = document.querySelector('.text-preview');
        const textIndicator = document.querySelector('.text-color-indicator');
        const bgIndicator = document.querySelector('.bg-color-indicator');
        
        if (colors.length > 0) {
            // 保存當前的顏色設置
            const currentTextColor = preview.style.color || '#333';
            const currentBgColor = preview.style.backgroundColor || '#ffffff';
            
            // 只更新顏色指示器，保持預覽區域的顏色不變
            textIndicator.style.backgroundColor = currentTextColor;
            bgIndicator.style.backgroundColor = currentBgColor;
            
            // 保持預覽區域的顏色設置
            preview.style.color = currentTextColor;
            preview.style.backgroundColor = currentBgColor;
        }
    }

    // 確保 isLightColor 函數更準確
    function isLightColor(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // 使用更精確亮度計算公式
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness >= 128;
    }

    // 添加初始化函數
    function initializePreview() {
        const preview = document.querySelector('.text-preview');
        const textIndicator = document.querySelector('.text-color-indicator');
        const bgIndicator = document.querySelector('.bg-color-indicator');
        
        // 設置初始狀態
        preview.style.color = '#333';
        preview.style.backgroundColor = '#ffffff';
        textIndicator.style.backgroundColor = '#333';
        bgIndicator.style.backgroundColor = '#ffffff';
    }

    // 在 DOMContentLoaded 事件中調用初始化
    initializePreview();

    // 設置複製按鈕件
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;
            const indicator = type === 'text' 
                ? document.querySelector('.text-color-indicator')
                : document.querySelector('.bg-color-indicator');
            
            const colorCode = indicator.dataset.color;
            
            if (colorCode) {
                navigator.clipboard.writeText(colorCode)
                    .then(() => {
                        // 顯示複製成功的提示
                        const originalText = button.textContent;
                        button.textContent = '已複製！';
                        setTimeout(() => {
                            button.textContent = originalText;
                        }, 1500);
                    })
                    .catch(err => {
                        console.error('複製失敗:', err);
                        alert('複製失敗，請手動複製');
                    });
            } else {
                alert('請先選擇顏色');
            }
        });
    });

    // 定義流行色數組（移到外部，使其可以被其他函數訪問）
    const trendingColors = [
        '#FF9B82', // Peach Echo (蜜桃橘)
        '#95B8D1', // Serenity Blue (寧靜藍)
        '#88B04B', // Greenery (草木綠)
        '#FFCDB2', // Apricot Crush (杏桃色)
        '#B5838D', // Mauve Shadows (藕荷色)
        '#98C1D9', // Powder Blue (粉藍)
        '#E5989B', // Blooming Dahlia (大麗花粉)
        '#6B9080', // Sage Green (鼠尾草綠)
        '#FFB4A2', // Coral Pink (珊瑚粉)
        '#A5A58D', // Sage (灰綠)
        '#CB997E', // Warm Taupe (暖駝色)
        '#DDBEA9', // Pale Dogwood (淡粉褐)
        '#B7B7A4', // Desert Sage (沙漠鼠尾草)
        '#A2D2FF', // Airy Blue (空氣藍)
        '#FCD5CE', // Rose Dawn (玫瑰晨光)
        '#E8E8E4', // Harbor Mist (港灣霧)
        '#F0EFEB', // Cloud Dancer (雲舞者)
        '#CCD5AE', // Celery (青芹綠)
        '#E9EDC9', // Tender Yellow (嫩黃)
        '#FAEDCD'  // Vanilla Custard (香草奶黃)
    ];

    // 修改流行色按鈕的事件處理
    const trendingBtn = document.getElementById('trendingBtn');
    
    trendingBtn.addEventListener('click', () => {
        // 清空現有的調色板
        colorPalette.innerHTML = '';
        
        // 添加流行色
        const sortedTrendingColors = sortColorsByHue(trendingColors);
        sortedTrendingColors.forEach(color => {
            colorPalette.appendChild(createColorBox(color));
        });
        
        // 更新預覽組件
        updatePreviewComponents(sortedTrendingColors);
    });
}); 
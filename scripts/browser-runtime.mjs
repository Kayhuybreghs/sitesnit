import {chromium,webkit} from 'playwright';
const engine=process.env.TEST_BROWSER || 'chromium';
if (!['chromium','webkit'].includes(engine)) throw Error('Unsupported test browser');
export const browserType=engine==='webkit'?webkit:chromium;
export const launchOptions={headless:true,...(engine==='chromium'&&process.env.TEST_BROWSER_EXECUTABLE?{executablePath:process.env.TEST_BROWSER_EXECUTABLE}:{})};
export const browserLabel=`Playwright ${engine}; viewport emulation, not a physical phone`;

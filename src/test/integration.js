var webdriver = require('selenium-webdriver');

var driver = new webdriver.Builder().
	withCapabilities(webdriver.Capabilities.chrome()).
	build();

driver.get('https://apustudentelections.firebaseapp.com/poll-officer/-Ks2AkwZu9h-U17c_Gec');
driver.findElement(webdriver.By.name('email')).sendKeys('pollone@apuelections.com');
driver.findElement(webdriver.By.name('password')).sendKeys('4Bravo5Echo');
driver.findElement(webdriver.By.className('ms-Button--primary')).click();
driver.wait(webdriver.until.elementLocated(webdriver.By.linkText('Dummy Test Election')));
driver.findElement(webdriver.By.linkText('Dummy Test Election')).click();
driver.wait(webdriver.until.elementLocated(webdriver.By.tagName('h2')));
const voters = ['aakriti.16_mad@apu.edu.in', 'aalla.sai16_mae@apu.edu.in'];
driver.findElement(webdriver.By.name('password')).sendKeys('4Bravo5Echo');
driver.quit();
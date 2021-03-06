const fs = require('fs');
const crypto = require('crypto');

//creates in and out directories if they dont exist
if (!fs.existsSync('./in/')) {
    fs.mkdirSync('./in/');
}
if (!fs.existsSync('./out/')) {
    fs.mkdirSync('./out/');
}

/* Console read interface */
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var currentAlgorithm = 'aes-256-ctr'; //default Algorithm

//simple main menu
const menu = async function(){
    while (true){
        var answer = await new Promise(answer => {
            rl.question('What action you want to do?\n 1. Encrypt\n 2. Decrypt\n 3. Exit\n', (answer));
        });
        switch (answer){
            case '3':
                process.exit();
            case '2':
                await DecryptMenu();
                break;
            case '1':
                await EncryptMenu();
                break;
            default:
                console.log(answer + ' is not a valid option');
                break;
        }
    }
}

//simple selectAlgorithm menu
const selectAlgorithm = async function(){
    var cancel = false;
    var isInValidOption = true;
    while (isInValidOption){
        var answer = await new Promise(answer => {
            rl.question('Which encryption algorithm you want to use (press Enter for default)?\n 1. aes-256-ctr (default)\n 2. aes-256-cbc\n 3. aes-256-cfb\n 4. aes-256-ofb\n 5. Cancel\n', (answer));
        });
        switch (answer){
            case '1':
                currentAlgorithm = 'aes-256-ctr';
                isInValidOption = false;
                break;
            case '2':
                currentAlgorithm = 'aes-256-cbc';
                isInValidOption = false;
                break;
            case '3':
                currentAlgorithm = 'aes-256-cfb';
                isInValidOption = false;
                break;
            case '4':
                currentAlgorithm = 'aes-256-ofb';
                isInValidOption = false;
                break;
            case '5':
                isInValidOption = false;
                cancel = true;
                break;
            case '':
                currentAlgorithm = 'aes-256-ctr';
                isInValidOption = false;
                break;
            default:
                console.log(answer + ' is not a valid option');
                isInValidOption = true;
                break;
        }
    }
    return cancel;
}

//Decrypt Menu with decryption code over crypto library
const DecryptMenu = async function(){
    var algorithmSelected = await selectAlgorithm();
    if(!algorithmSelected){
        var answer = await new Promise(answer => {
            rl.question('Please write the password:\n', (answer));
        });
        answer = crypto.createHash('sha256').update(String(answer)).digest();
        files = fs.readdirSync('./in');
        files.forEach(function(file) {
            if (fs.statSync('./in/' + file).isDirectory()){
                console.log('./in/' + file + ' is a directory, it will be ignored...');
            } else {
                fileToDecrypt = fs.readFileSync('./in/' + file);
                fileToDecrypt = fileToDecrypt.toString();
                let fileParts = fileToDecrypt.split(':');
                let iv = Buffer.from(fileParts.shift(), 'hex');
                let encryptedFile = Buffer.from(fileParts.join(':'), 'hex');
                let decipher = crypto.createDecipheriv(currentAlgorithm, answer, iv);
                let decrypted = decipher.update(encryptedFile);
                decrypted = Buffer.concat([decrypted, decipher.final()]);
                if(fs.existsSync('./out/' + file)){
                    console.log('Ya existe archivo con nombre ' + file + ' en ./out por lo tanto no se pudo desencriptar ./in/' + file);
                } else {
                    try{
                        fs.writeFileSync('./out/' + file, decrypted);
                        console.log('file Decrypted: ' + './out/' + file);
                    } catch (err) {
                        console.log('unexpected error:\n' + err);
                    }
                }
            }
        });
    }
}

//Encryption Menu with encryption code over crypto library
const EncryptMenu = async function(){
    var algorithmSelected = await selectAlgorithm();
    if(!algorithmSelected){
        answer = await new Promise(answer => {
            rl.question('Please write a password:\n', (answer));
        });
        var iv = crypto.randomBytes(16);
        answer = crypto.createHash('sha256').update(String(answer)).digest();
        files = fs.readdirSync('./in');
        files.forEach(function(file) {
            if (fs.statSync('./in/' + file).isDirectory()){
                console.log('./in/' + file + ' is a directory, it will be ignored...');
            } else {
                fileToEncrypt = fs.readFileSync('./in/' + file);
                const cipher = crypto.createCipheriv(currentAlgorithm, secretKey, iv);
                let endmsg = cipher.update(fileToEncrypt);
                endmsg = Buffer.concat([endmsg, cipher.final()]);
                if(fs.existsSync('./out/' + file)){
                    console.log('Ya existe archivo con nombre ' + file + ' en ./out por lo tanto no se pudo encriptar ./in/' + file);
                } else {
                    try{
                        fs.writeFileSync('./out/' + file, iv.toString('hex') + ':' + endmsg.toString('hex'));
                        console.log('file encrypted: ./in/' + file);
                    } catch (err) {
                        console.log('unexpected error:\n' + err);
                    }
                }
            }
        });
    }
}

menu();
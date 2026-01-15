import bcrypt from 'bcrypt';

const [,, plain] = process.argv;

if (!plain) {
    console.error('Usage: node hashPassword.js "MotDePasse"');
    process.exit(1);
}

(async () => {
    try{
        const hash = await bcrypt.hash(plain, 10);
        console.log(hash);
    }  catch (err) {
        console.error('Erreur:', err.message);
    }
})();
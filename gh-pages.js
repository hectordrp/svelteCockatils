var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/hectordrp/svelteCocktails.git',
        user: {
            name: 'Hector del Rosario', 
            email: 'hectordrp@hotmail.com' 
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)
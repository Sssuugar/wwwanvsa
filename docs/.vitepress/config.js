import fs from 'fs'
import path from 'path'

function getSidebar() {
    const sidebar = []
    // Now scanning the 'content' subdirectory inside docs
    const contentPath = path.resolve(process.cwd(), 'docs/content')

    if (!fs.existsSync(contentPath)) return []

    const dirs = fs.readdirSync(contentPath).filter(f => {
        const stats = fs.statSync(path.join(contentPath, f))
        return stats.isDirectory()
    })

    dirs.forEach(dir => {
        const dirPath = path.join(contentPath, dir)
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'))

        if (files.length > 0) {
            sidebar.push({
                text: dir.toUpperCase(),
                collapsible: true,
                collapsed: false,
                items: files.map(file => {
                    const name = path.basename(file, '.md')
                    return {
                        text: name,
                        // Links must now include /content/ prefix
                        link: `/content/${dir}/${name}`
                    }
                })
            })
        }
    })
    return sidebar
}

export default {
    title: 'WwwAnvsa Docs',
    description: 'A runoob-like documentation site',
    themeConfig: {
        sidebar: getSidebar(),
        nav: [
            { text: 'Home', link: '/' },
            // Add a nav link directly to the content folder if needed, 
            // but dynamic sidebar usually handles navigation well.
        ]
    }
}

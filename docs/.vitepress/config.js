import fs from 'fs'
import path from 'path'

function getSidebar() {
    // Now scanning the 'content' subdirectory inside docs
    const contentPath = path.resolve(process.cwd(), 'docs/content')

    if (!fs.existsSync(contentPath)) return []

    function getItems(dir) {
        const items = []
        const files = fs.readdirSync(dir)

        files.forEach(file => {
            const fullPath = path.join(dir, file)
            const stats = fs.statSync(fullPath)

            if (stats.isDirectory()) {
                // If it is a directory, verify if it has content
                const children = getItems(fullPath)
                if (children.length > 0) {
                    items.push({
                        text: file, // Use folder name as text (maybe capitalize?)
                        collapsible: true,
                        // collapsed: true, // Optional: collapse by default for deep nesting
                        items: children
                    })
                }
            } else if (file.endsWith('.md')) {
                // Determine the link path relative to 'docs'
                // fullPath: d:\code\...\docs\content\Category\File.md
                // root: d:\code\...\docs
                // link: /content/Category/File.md
                const relativePath = path.relative(path.resolve(process.cwd(), 'docs'), fullPath)
                // Fix windows backslashes
                const link = '/' + relativePath.split(path.sep).join('/')

                const name = path.basename(file, '.md')
                items.push({
                    text: name,
                    link: link
                })
            }
        })
        return items
    }

    // Top level directories in 'content' are treated as main sidebar groups
    const sidebar = []
    const topDirs = fs.readdirSync(contentPath).filter(f => {
        return fs.statSync(path.join(contentPath, f)).isDirectory()
    })

    topDirs.forEach(dir => {
        const fullDirPath = path.join(contentPath, dir)
        const children = getItems(fullDirPath)

        if (children.length > 0) {
            sidebar.push({
                text: dir.toUpperCase(),
                collapsible: true, // Top level collapsible
                items: children
            })
        }
    })

    return sidebar
}

export default {
    title: 'Anvsa',
    description: '一个胡言乱语的天地',
    outDir: '../dist',
    themeConfig: {

        sidebar: getSidebar(),
        nav: [
            { text: 'Home', link: '/' },
            // Add a nav link directly to the content folder if needed, 
            // but dynamic sidebar usually handles navigation well.
        ]
    }
}

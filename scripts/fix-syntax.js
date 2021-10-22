const fs = require('fs')
const path = require('path')

/**
 * Check if given path is directory
 *
 * @param {string} location The location to search
 * @returns {boolean} True if location is type of directory
 */
const isDir = (location) => fs.statSync(location).isDirectory()

/**
 * Find all files of root directory
 *
 * @param {string} root The root directory to start searching
 * @returns The array of files with full path
 */
const findAll = (root = path.join(process.cwd(), 'docs')) => {
  const results = []
  const files = fs.readdirSync(root)

  for (let i = 0, l = files.length; i < l; i++) {
    const file = path.join(root, files[i])

    if (isDir(file)) {
      results.push(...findAll(file))
    } else {
      results.push(file)
    }
  }

  return results
}

/**
 * Replace invalid syntaxes
 *
 * @param {string} content The content of article
 * @returns Fixed article content
 */
const fix = (content = '') => {
  return content
    .replace(/<h1 align="center">\w+<\/h1>\n+(#+\W[\.\w>< -]+)?/im, '') // replace useless headers
    .replace(/(#+) +([\.\w>< -]+)/ig, (match, p1, p2) => {
      if (/[`]/.test(p2 + '') || !/[<>]/.test(p2 + '')) {
        return `${p1} ${p2}`
      }

      return `${p1} \`${p2}\``
    }) // cover headers
    .replace(/\[(.*)\]\(\)/ig, '$1') // unlink empty links
    .replace(/(<a (?:name|id)="[\w-]+"><\/a.?>)\n+/igm, '$1\n\n') // add line break after manual link
    .replace(/\<(?:br)\>/ig, '<br/>') // find unclosed things
    .replace(/\(\/docs\/([\w-]+\.md)\)/ig, '($1)') // /docs/* to *
    .replace(/\(\/([\w-]+\.md)\)/ig, '(https://github.com/fastify/fastify/blob/main/$1)') // /* to fastify/fastify/*
}

findAll()
  .forEach(file => {
    const updated = fix(fs.readFileSync(file, 'utf-8'))

    fs.writeFileSync(
      file,
      updated,
      'utf-8'
    )
  })

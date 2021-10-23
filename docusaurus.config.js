// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Fastify; language=ko',
  tagline: 'Fastify는 여러분의 서버를 더욱 빠르게 바꿔줄 경량 Node.JS 서버입니다.',
  url: 'https://fastify-kr.seia.io',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'seia-soto', // Usually your GitHub org/user name.
  projectName: 'fastify-kr', // Usually your repo name.

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/'
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/blog/'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Fastify-KR',
        items: [
          {
            href: '/docs/Getting-Started',
            label: 'Docs',
            position: 'left'
          },
          {
            type: 'docsVersionDropdown',
            position: 'right'
          },
          {
            href: 'https://github.com/seia-soto/fastify-kr',
            label: 'GitHub',
            position: 'right'
          },
          {
            href: 'https://github.com/fastify/fastify',
            label: 'Fastify',
            position: 'right'
          }
        ]
      },
      footer: {
        style: 'dark',
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} Fastify and Seia-Soto/Fastify-KR contributors. Built with Docusaurus.`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
}

module.exports = config

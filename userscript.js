// ==UserScript==
// @name         Artstation addons
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Artstation projects page addons: general stats, conversions
// @author       tearat
// @match        https://www.artstation.com/myartstation/projects
// @icon         https://www.google.com/s2/favicons?sz=64&domain=artstation.com
// @grant        none
// ==/UserScript==

;(function () {
  'use strict'

  function parseNumber(node) {
    let text = node.split('</i>')[1]
    const isMoreThanThousand = text.indexOf('K') > -1
    let number = parseFloat(text)
    return isMoreThanThousand ? number * 1000 : number
  }

  function extractArtData(art) {
    const title = art.getElementsByClassName('project-title')[0].innerHTML
    const link = art.getElementsByClassName('project-link')[0].getAttribute('href').split('/')[3]
    const meta = art.getElementsByClassName('project-meta')[0]
    const views = meta.childNodes[0] ? parseNumber(meta.childNodes[0].innerHTML) : 1 // prevents dividing by zero
    const likes = meta.childNodes[1] ? parseNumber(meta.childNodes[1].innerHTML) : 0
    const comments = meta.childNodes[2] ? parseNumber(meta.childNodes[2].innerHTML) : 0
    const conversion = Math.floor((likes / views) * 100)
    return {
      title,
      link,
      views,
      likes,
      comments,
      conversion,
      meta,
    }
  }

  function renderGeneralStats(arts) {
    const totalViews = arts.reduce((acc, art) => acc + art.views, 0)
    const totalLikes = arts.reduce((acc, art) => acc + art.likes, 0)
    const totalComments = arts.reduce((acc, art) => acc + art.comments, 0)

    let mostViewed = [...arts.sort((a, b) => b.views - a.views).slice(0, 5)]
    let mostLiked = [...arts.sort((a, b) => b.likes - a.likes).slice(0, 5)]
    let mostCommented = [...arts.sort((a, b) => b.comments - a.comments).slice(0, 5)]

    const portfolioContentNode = document.getElementsByClassName('portfolio-content')[0]
    const projectListNode = document.getElementsByClassName('project-list')[0]
    const statDiv = document.createElement('div')
    const viewsToLikeConversion = Math.floor((totalLikes / totalViews) * 100)
    const viewsToCommentConversion = Math.floor((totalComments / totalViews) * 100)
    statDiv.innerHTML += `Views: ${totalViews} <br> Likes: ${totalLikes} <br> Comments: ${totalComments} <br>`
    statDiv.innerHTML += `Views-to-like conversion: ${viewsToLikeConversion}% <br> Views-to-comment conversion: ${viewsToCommentConversion}% <br>`

    statDiv.innerHTML +=
      `Most viewed arts: ` +
      mostViewed
        .map(
          (art) =>
            `<a href='https://www.artstation.com/artwork/${art.link}' target='_blank'>${art.title}</a> (${art.views} views)`
        )
        .join(', ') +
      `<br>`
    statDiv.innerHTML +=
      `Most liked arts: ` +
      mostLiked
        .map(
          (art) =>
            `<a href='https://www.artstation.com/artwork/${art.link}' target='_blank'>${art.title}</a> (${art.likes} likes)`
        )
        .join(', ') +
      `<br>`
    statDiv.innerHTML +=
      `Most commented arts: ` +
      mostCommented
        .map(
          (art) =>
            `<a href='https://www.artstation.com/artwork/${art.link}' target='_blank'>${art.title}</a> (${art.comments} comments)`
        )
        .join(', ') +
      `<br>`
    statDiv.style.paddingLeft = '15px'
    statDiv.style.borderLeft = '4px solid #f0ad4e'

    portfolioContentNode.insertBefore(statDiv, projectListNode)
  }

  function addConversions(arts) {
    for (var i = 0; i < arts.length; i++) {
      const art = arts[i]
      const newChild = document.createElement('div')
      newChild.classList.add('project-meta-item')
      newChild.innerHTML = `${art.conversion}%`
      newChild.style.color = 'limegreen'
      art.meta.appendChild(newChild)
    }
  }

  window.addEventListener('load', () => {
    const projectNodes = document.getElementsByClassName('project-inner')
    const arts = []
    for (var n = 0; n < projectNodes.length; n++) {
      arts.push(extractArtData(projectNodes[n]))
    }
    addConversions(arts)
    renderGeneralStats(arts)
  })
})()

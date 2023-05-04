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

(function() {
    'use strict';
    function parseNumber(node) {
        let text = node.split('</i>')[1]
        const isMoreThanThousand = text.indexOf('K') > -1
        let number = parseInt(text)
        return isMoreThanThousand ? number * 1000 : number
    }

    function renderStats(totalViews, totalLikes, totalComments) {
        const portfolioContentNode = document.getElementsByClassName('portfolio-content')[0]
        const projectListNode = document.getElementsByClassName('project-list')[0]
        const statDiv = document.createElement("div")
        const viewsToLikeConversion = Math.floor(totalLikes / totalViews * 100)
        const viewsToCommentConversion = Math.floor(totalComments / totalViews * 100)
        statDiv.innerHTML += `<h2>General statistics:</h2>`
        statDiv.innerHTML += `Views: ${totalViews} <br> Likes: ${totalLikes} <br> Comments: ${totalComments} <br>`
        statDiv.innerHTML += `Views-to-like conversion: ${viewsToLikeConversion}% <br> Views-to-comment conversion: ${viewsToCommentConversion}%`
        portfolioContentNode.insertBefore(statDiv, projectListNode)
    }

    function addConversions() {
        const metas = document.getElementsByClassName('project-meta')
        let totalViews = 0
        let totalLikes = 0
        let totalComments = 0
        for (var i = 0; i < metas.length; i++) {
            const meta = metas[i]
            let views = parseNumber(meta.childNodes[0].innerHTML)
            if(!meta.childNodes[1]) continue;
            const likes = parseNumber(meta.childNodes[1].innerHTML)
            totalViews += views
            totalLikes += likes
            if(meta.childNodes[2]) {
                const comments = parseNumber(meta.childNodes[2].innerHTML)
                totalComments += comments
            }
            const conversion = Math.floor(likes / views * 100)
            const newChild = document.createElement("div")
            newChild.classList.add("project-meta-item");
            newChild.innerHTML = `${conversion}%`
            newChild.style.color = 'limegreen'
            meta.appendChild(newChild)
        }
        renderStats(totalViews, totalLikes, totalComments)
    }

    window.addEventListener("load", (event) => {
        addConversions()
    });
})();

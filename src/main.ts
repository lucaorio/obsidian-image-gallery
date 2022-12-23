import { Plugin } from 'obsidian'
import { imgGalleryInit } from './init';

export default class ImgGallery extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor('img-gallery', (src, el, ctx) => {
      const handler = new imgGalleryInit(this, src, el, this.app)
      ctx.addChild(handler)
    })
  }

  onunload() {}
}

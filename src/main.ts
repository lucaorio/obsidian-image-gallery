import { Plugin } from 'obsidian'
import { imgGalleryRenderer } from './img-gallery-renderer';

export default class ImgGallery extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor('img-gallery', (src, el, ctx) => {
      const handler = new imgGalleryRenderer(this, src, el, this.app)
      ctx.addChild(handler)
    })
  }

  onunload() {}
}

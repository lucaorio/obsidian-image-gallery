const renderError = (container: HTMLElement, error: string) => {
  // render a custom error and style it
  const wrapper = container.createEl('div')
  wrapper.createEl('p', {text: `(Error) Image Gallery: ${error}`});

  wrapper.style.borderRadius = '4px'
  wrapper.style.padding = '2px 16px'
  wrapper.style.backgroundColor = '#e50914'
  wrapper.style.color = '#fff'
  wrapper.style.fontWeight = 'bolder'
}

export default renderError

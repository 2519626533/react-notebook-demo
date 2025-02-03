const LanguageSelector = (props: JSX.IntrinsicElements['select']) => {
  return (
    <select
      data-test-id="language-select"
      contentEditable={false}
      className="language-selector"
      {...props}
    >
      <option value="html">HTML</option>
      <option value="css">CSS</option>
      <option value="javascript">JavaScript</option>
      <option value="typescript">TypeScript</option>
      <option value="jsx">JSX</option>
      <option value="tsx">TSX</option>
      <option value="java">Java</option>
      <option value="markdown">Markdown</option>
      <option value="php">PHP</option>
      <option value="python">Python</option>
      <option value="sql">SQL</option>
    </select>
  )
}

export default LanguageSelector

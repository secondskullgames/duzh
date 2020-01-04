{
  const { maps, renderer } = window.jwb;

  window.jwb.state = {
    map: maps.SAMPLE_MAP,
    messages: []
  };

  window.onload = () => renderer.render();
}
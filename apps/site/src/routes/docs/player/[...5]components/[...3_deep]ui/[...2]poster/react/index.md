<script>
import Docs from '../_Docs.md';
</script>

<Docs>

```jsx copyHighlight{4}|slot=usage
<Media>
  <Video poster="https://media-files.vidstack.io/poster.png">{/* ... */}</Video>

  <Poster alt="Large alien ship hovering over New York." />
</Media>
```

```jsx copyHighlight{4-15}|slot=styling
<Media>
  <Video poster="https://media-files.vidstack.io/poster.png">{/* ... */}</Video>

  <Poster alt="Large alien ship hovering over New York." />

  <div className="big-play-button-container">
    <PlayButton className="big-play-button">
      <svg className="play-icon" ariaHidden="true" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M19.376 12.416L8.777 19.482A.5.5 0 0 1 8 19.066V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832z"
        />
      </svg>
    </PlayButton>
  </div>
</Media>
```

</Docs>

export default function highlightUrls(text) {
  const urlRegex = /((https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}([/\w\-.?&=%]*)?)/g;

  const parts = [];
  let lastIndex = 0;
  String(text).replace(urlRegex, (url, _, __, ___, ____, offset, ...args) => {
    if (offset === undefined) console.log(args)
    if (offset > lastIndex) {
      parts.push(text.slice(lastIndex, offset)); // Add normal text
    }

    parts.push(
      <a
        key={offset}
        href={url.startsWith('http') || url.startsWith('https') ? url : `https://${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="message-url"
      >
        {url}
      </a>
    );
    lastIndex = offset + url.length;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex)); // Add remaining text
  }
  return parts;
}

/**
 * 
 * @param {HTMLElement} element 
 * @returns 
 */
export const attachScrollOnResize = (element) => {
  const observer = new ResizeObserver(() => {
    setTimeout(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }, 100);
  });

  observer.observe(element);

  return () => observer.disconnect();
};

/**
 * Yes—what you’re doing for `focus` can be adapted for **resize**, but there’s no native `"resize"` event for arbitrary DOM elements. Instead, you should use the **ResizeObserver**, which is designed exactly for this.

Here’s how you can implement it 👇

---

## ✅ Scroll to center when a container resizes

```js
export const attachScrollOnResize = (element) => {
  const observer = new ResizeObserver(() => {
    // Optional delay if layout is still settling
    setTimeout(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }, 100);
  });

  observer.observe(element);

  return () => observer.disconnect(); // cleanup
};
```

---

## 💡 Notes & Improvements

### 1. Avoid too many scroll triggers

Resize events can fire **a lot**, so you may want to debounce:

```js
let timeout;

const observer = new ResizeObserver(() => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }, 100);
});
```

---

### 2. Only scroll if needed

Sometimes resizing doesn’t move the element out of view. You can check first:

```js
const isCenteredInViewport = (el) => {
  const rect = el.getBoundingClientRect();
  const viewportCenter = window.innerHeight / 2;
  const elCenter = rect.top + rect.height / 2;

  return Math.abs(viewportCenter - elCenter) < 20; // tolerance
};
```

Then:

```js
if (!isCenteredInViewport(element)) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
```

---

### 3. Watch the container vs. the content

* If the **container itself resizes** → observe the container
* If the **content inside changes size** → observe the inner element instead

---

## ⚠️ Gotchas

* `scrollIntoView({ block: 'center' })` centers relative to the **nearest scrollable ancestor**, not always the full page.
* If you need pixel-perfect centering in a specific scroll container, you may need manual scrolling:

```js
const parent = element.parentElement;
const rect = element.getBoundingClientRect();
const parentRect = parent.getBoundingClientRect();

parent.scrollTop += rect.top - parentRect.top - parentRect.height / 2 + rect.height / 2;
```

---

## 👍 Summary

* Use **ResizeObserver** instead of a resize event
* Debounce it to avoid jank
* Optionally check if scrolling is necessary
* Fall back to manual scroll math for precise control

---

If you want, I can tailor this to React (hook), Vue, or a specific layout (like chat UI or virtual list).

 */
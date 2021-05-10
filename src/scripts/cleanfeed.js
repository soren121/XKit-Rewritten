let blockingMode;
let reblogSelector;

const excludeClass = 'xkit-cleanfeed-done';
const hiddenClass = 'xkit-cleanfeed-filtered';

const processPosts = async function () {
  const { getPostElements } = await fakeImport('/util/interface.js');
  const { timelineObjectMemoized } = await fakeImport('/util/react_props.js');

  getPostElements({ excludeClass }).forEach(async postElement => {
    if (blockingMode === 'all') {
      postElement.classList.add(hiddenClass);
      return;
    }

    const postTimelineObject = await timelineObjectMemoized(postElement.dataset.id);

    {
      const { blog: { isAdult } } = postTimelineObject;
      if (isAdult) {
        postElement.classList.add(hiddenClass);
        return;
      }
    }

    const reblogs = postElement.querySelectorAll(reblogSelector);
    const { trail } = postTimelineObject;
    trail.forEach((trailItem, i) => {
      if (trailItem.blog === undefined) {
        return;
      }

      const { blog: { isAdult } } = trailItem;
      if (isAdult) {
        reblogs[i].classList.add(hiddenClass);
      }
    });
  });
};

export const main = async function () {
  const { getPreferences } = await fakeImport('/util/preferences.js');
  const { onNewPosts } = await fakeImport('/util/mutations.js');
  const { keyToCss } = await fakeImport('/util/css_map.js');

  reblogSelector = await keyToCss('reblog');

  ({ blockingMode } = await getPreferences('cleanfeed'));

  onNewPosts.addListener(processPosts);
  processPosts();
};

export const clean = async function () {
  const { onNewPosts } = await fakeImport('/util/mutations.js');
  onNewPosts.removeListener(processPosts);

  $(`.${excludeClass}`).removeClass(excludeClass);
  $(`.${hiddenClass}`).removeClass(hiddenClass);
};

export const stylesheet = true;
export const autoRestart = true;

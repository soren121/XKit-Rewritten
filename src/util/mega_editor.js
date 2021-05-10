let formKey;

const pathnames = {
  add: 'add_tags_to_posts',
  remove: 'remove_tags_from_posts',
  delete: 'delete_posts'
};

/*
 * @param {object[]} postIds - Array of post IDs to edit (must not exceed 100 items)
 * @param {object} options - Configuration object
 * @param {String} options.mode - Post editing method; valid modes are:
 *                                 1. "add" (add tags to posts)
 *                                 2. "remove" (remove tags from posts)
 *                                 3. "delete" (delete posts)
 * @param {object[]} options.tags - Array of tags to add or remove. Required if options.mode is "add" or "remove"
 */
export const megaEdit = async function (postIds, options) {
  const { inject } = await fakeImport('/util/inject.js');
  const pathname = pathnames[options.mode];

  if (!formKey) {
    formKey = await fetch('https://www.tumblr.com/about').then(response => {
      if (response.ok) {
        return response.text();
      } else {
        throw Object.assign(new Error(response.status), { response });
      }
    }).then(responseText => {
      const responseDocument = (new DOMParser()).parseFromString(responseText, 'text/html');
      return responseDocument.getElementById('tumblr_form_key').getAttribute('content');
    }).catch(console.error);
  }

  const requestBody = {
    post_ids: postIds.join(','),
    form_key: formKey,
    tags: options.tags ? options.tags.join(',') : ''
  };

  if (options.mode === 'delete') {
    delete requestBody.tags;
  }

  return inject((resource, body) => fetch(resource, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body
  }), [`https://www.tumblr.com/${pathname}`, $.param(requestBody)]);
};

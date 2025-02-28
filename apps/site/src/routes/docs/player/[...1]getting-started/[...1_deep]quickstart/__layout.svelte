<script lang="ts">
  import clsx from 'clsx';

  import { goto } from '$app/navigation';
  import { navigating, page } from '$app/stores';
  import { Chip, Select, Steps, Step } from '@svelteness/kit-docs';

  import InstallNpm from './_components/_InstallNPM.md';
  import InstallCdn from './_components/_InstallCDN.md';
  import LibHtml from './_components/_LibHTML.md';
  import LibReact from './_components/_LibReact.md';
  import ProviderHls from './_components/_ProviderHls.md';
  import BrowserSupport from './_components/_BrowserSupport.md';
  import PostInstall from './_components/_PostInstall.md';

  import {
    installMethod as _installMethod,
    type InstallMethodType,
  } from '$lib/stores/installMethod';
  import { framework, framework as _framework, type FrameworkType } from '$lib/stores/framework';

  const basePath = '/docs/player/getting-started/quickstart';

  const installOptions = ['NPM', 'CDN'];
  const frameworkOptions = ['HTML', 'React'];
  const providerOptions = ['Audio', 'Video', 'HLS'];

  let installMethod = getSelectionFromPath(installOptions) ?? 'NPM';
  let frameworkType = getSelectionFromPath(frameworkOptions) ?? 'HTML';
  let providerType = getSelectionFromPath(providerOptions) ?? 'Video';

  let isFrameworkDisabled = installMethod === 'CDN';

  $: providerLink = `/docs/player/components/providers/${providerType.toLowerCase()}${
    frameworkType === 'React' ? '/react' : ''
  }`;
  $: providerApiLink = `${providerLink}/api`;

  $: if ($navigating?.to.pathname === basePath) {
    installMethod = 'NPM';
    frameworkType = 'HTML';
    providerType = 'Video';
  }

  $: if (installMethod === 'CDN') {
    frameworkType = 'HTML';
    isFrameworkDisabled = true;
  } else {
    isFrameworkDisabled = false;
  }

  function getSelectionFromPath(values: string[]) {
    for (const value of values) {
      if ($page.url.pathname.includes(`/${value.toLowerCase()}`)) {
        return value;
      }
    }
  }

  function onOptionsChange() {
    const isCDNInstallMethod = installMethod === 'CDN';
    const isVideoProvider = providerType === 'Video';
    const isReact = frameworkType === 'React';
    const isDefault = isVideoProvider && !isReact;

    let installPath = isCDNInstallMethod ? '/cdn' : '';
    let frameworkPath = isReact && !isCDNInstallMethod ? '/react' : '';
    let providerPath = !isCDNInstallMethod && isDefault ? '' : `/${providerType}`;
    let slug = `${basePath}${installPath}${frameworkPath}${providerPath}`.toLowerCase();

    if ($page.url.pathname !== slug) {
      goto(slug, { noscroll: true });
    }

    $_installMethod = installMethod.toLowerCase() as InstallMethodType;
    $_framework = frameworkType.toLowerCase() as FrameworkType;
  }
</script>

<h1>Quickstart</h1>

<p>
  This section will get you up and running with the library. You'll find specific instructions below
  depending on the type of installation method (NPM/CDN), framework (HTML/React), and provider
  (Audio/Video/HLS) you opt to use.
</p>

<BrowserSupport />

<h2
  id="player-installation"
  class="992:flex-row 992:items-center mb-10 flex flex-col"
  tabindex="-1"
>
  <div class="flex">
    <a href="#player-installation" class="header-anchor mr-1" aria-hidden="true">#</a>
    Player Installation
  </div>
  <div class="992:ml-2 992:mt-0 mt-4 -ml-2 inline-flex space-x-1.5 text-white dark:text-black">
    <Chip class={clsx(installMethod === 'CDN' ? 'bg-lime-600 dark:bg-lime-300' : 'hidden')}>
      {installMethod}
    </Chip>
    <Chip class={clsx(frameworkType === 'HTML' ? 'hidden' : 'bg-sky-600 dark:bg-sky-300')}>
      {frameworkType}
    </Chip>
    <Chip class="bg-indigo-600 dark:bg-indigo-300">
      {providerType}
    </Chip>
  </div>
</h2>

<Steps>
  <Step orientation="vertical">
    <h3 slot="title">Select Installation Method</h3>

    <Select
      title="Select Installation Method"
      options={installOptions}
      bind:value={installMethod}
      on:change={onOptionsChange}
    />

    {#if installMethod === 'NPM'}
      <InstallNpm />
    {:else}
      <InstallCdn />
    {/if}
  </Step>

  {#if !isFrameworkDisabled}
    <Step orientation="vertical">
      <h3 slot="title">Select Library</h3>

      <Select
        title="Select Library"
        options={frameworkOptions}
        bind:value={frameworkType}
        on:change={onOptionsChange}
      />

      {#if frameworkType === 'HTML'}
        <LibHtml />
      {:else}
        <LibReact />
      {/if}
    </Step>
  {/if}

  <Step orientation="vertical">
    <h3 slot="title">Select Media Provider</h3>

    <Select
      title="Select Media Provider"
      options={providerOptions}
      bind:value={providerType}
      on:change={onOptionsChange}
    />

    {#if providerType === 'Audio'}
      <p>
        Embed sound content into documents via the native <code>&lt;audio&gt;</code> element.
      </p>
    {:else if providerType === 'Video'}
      <p>
        Embed video content into documents via the native <code>&lt;video&gt;</code> element.
      </p>
    {:else if providerType === 'HLS'}
      <ProviderHls />
    {/if}
  </Step>

  <slot />
</Steps>

<PostInstall {providerType} {frameworkType} {installMethod} />

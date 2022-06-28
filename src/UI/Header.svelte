  <script>
    import { spring } from 'svelte/motion';
    import { searchTextBoxStore } from '../cocktails/cocktails-store';

    let collapsed = true;
    let searchInput;
    function toggleSearch() {
      inputSize.set(collapsed ? 20 : 1.85)
      collapsed ? searchInput.focus() : clearSearch();
      collapsed = !collapsed;
    }

    let inputSize = spring(1.85);
    let searchTextBox = "";

    function searchText(text) {
      console.log(text)
      searchTextBoxStore.setSearch(text)
      console.log($searchTextBoxStore) 
    }

    function clearSearch() {
      searchText("") 
      searchInput.value = "";
    }

    
    $: searchText(searchTextBox)

  </script>

  <header>
    <h1>Cocktails</h1>

    <div class='searchBoxContainer' style="width: {$inputSize}rem;">
      <button class='searchBtn' on:click={toggleSearch}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z"/></svg>
      </button>
      <input class='searchBox' focused={!collapsed} bind:this={searchInput} bind:value={searchTextBox} style="width: {$inputSize -1.85}rem;" >
    </div>
  </header>
  
<style>
    header {
        width: 100%;
        height: 4rem;
        display: flex;
        padding: 0 1rem;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
    }
  
    h1 {
        color: #000;
        font-family: "Roboto Slab", serif;
        margin: 0;
    }

     .searchBoxContainer {
      display: inline-block;
      box-sizing: content-box;
      padding: 0;
      background-color: #fff;
      border: 3px solid #366bf426;
      border-radius: 28px;
      overflow: hidden;
      margin-top: 6px;
      height: 1.85rem;
    }

    .searchBoxContainer.collapsed {
      width: 1.85rem;
    }
    .searchBoxContainer .searchBtn {
      display: inline-block;
      margin: 0;
      padding: 5px;
      border: 0;
      outline: none;

      width: 1.85rem;
      height: 1.85rem;
    }
    .searchBoxContainer input {
      display: inline-block;
      margin: 0;
      padding: 5px;
      border: 0;
      outline: none;
      height: 100%;
      max-width: calc(100% - 1.85rem);

    }
    
    .searchBox {
      float: left;
      font-size: 1rem;
      color: #212121;
      background-color: #fff;
    }
    
    .searchBtn {
      float: right;
      width: 50px;
      left: 0;
      top: 0;
      font-size: 1.2em;
      text-align: center;
      cursor: pointer;
      background-color: #fff;

      padding: 5px;
    width: 1.75rem;
    } 

  </style>
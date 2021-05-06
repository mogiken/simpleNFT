# 概要
シンプルなNFTをデプロイするサンプルプログラムの作成手順と解説です。ksuharaさんのページを参考にさせていただきました。
参考：

https://qiita.com/ksuhara/items/55296e5098bc27061d13

基本部分は同じです。内容をシンプルにし、初心者用がよくはまるパターンの補足、craco,Reactの導入とUIでのNFTのDeploy,Mint部分を追記しています。testなどうまく動いていない部分も修正しています。
# ゴール
* NFTの開発環境が構築できる
* NFTのtest環境が構築できる
* NFTのReactを使ったUI環境が構築できる。
* NFTのdeploy,mintをMetamaskを通じてUIから実行するプログラムが理解できる。
* テストネットrinkebyの検証方法が理解できる。
* 下記のようなNFTを操作するUIが作成できます。

|![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/23175/fc7687f9-ff9c-67c5-1042-0658c4cee74a.png)|
|:--|

・コードは下記に置いています。

https://github.com/mogiken/simpleNFT


# 前提(事前準備)
Ubuntu20.04で動作確認してます。
Node.jsがインストール済み。
Ubuntuで開発ができる。
JavaScriptの開発経験がある。
Metamaskの導入、操作がわかる。
テストネットRinkebyでETHをもらっておいてください。

https://faucet.rinkeby.io/

twitterで送金してほしいアドレスをつぶやいてURLを貼り付けると数時間以内にETHが送金されます。

私は上記環境を、DockerのUnintu20.04 + sshで作成し、VisualStudioCode + extentionのsftpで接続してプログラム開発しました。
MacやWindowsのwsl2でも動くと思います。

# プロジェクト作成

プロジェクトフォルダーを作成

```
mkdir simpleNFT
cd simpleNFT
```
packagesにfront と contractのフォルダーを作成

```
mkdir packages
cd packages
mkdir frontend
mkdir contracts
```
以下のようなフォルダー構成になればOKです。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/23175/a5b4751d-9500-cefc-ed91-db1e7e6b5f68.png)

# contractsフォルダーでの環境構築

contractsに移動してプロジェクトを作成します。

```
cd contracts
npm init -y
```
コントラクトの開発環境はhardhatを使います。この環境を作成します。
参考：

https://hardhat.org/

```
npx hardhat init
```
上記を実行するとメニューが表示されます。create a sample projectを選択し、回答はデフォルトでOKです。

次に、hardhatの動作確認を行います。エラーが表示されなければOKです。

```
yarn hardhat test
```

次に、contracts/package.jsonのscripts部分を以下に変更してください。

```contracts/package.json
"scripts": {
  "test": "hardhat test test/sample-test.js --network localhost",
  "localchain": "hardhat node",
  "deploy": "hardhat run scripts/sample-script.js --network localhost"
},

```
上記のスクリプトの説明
yarn testでdeployのテストを実行する
yarn localchainでローカル環境にブロックチェーン環境を立ち上げる
yarn deployでローカルチェーンにコントラクトをデプロイする

次に、コントラクトのライブラリーを導入します。openzeppelinというライブラリーを使います。

```
yarn add @openzeppelin/contracts
```
simpleNFT\packages\contracts\contractsにあるGreeter.solをNFT.solにファイル名を変更して内容を変更します。
ERC721PresetMinterPauserAutoIdを継承して、name, symbol, tokenURIを固定で引数に渡しています。
参考：

https://docs.openzeppelin.com/contracts/3.x/api/presets

ちゃんとGreeter.solを削除しないとtestの時にエラーになります。

```contracts/NFT.sol
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
contract NFT is ERC721PresetMinterPauserAutoId {
  constructor() ERC721PresetMinterPauserAutoId("name", "symbol", "http://localhost:3000") {}
}
```
次に、hardhat.config.jsのsolidityのバージョンをコントラクトのバージョンに合わせて変更します。

```
solidity: "0.8.0",
```

次に、NFTコントラクトのデプロイのテストプログラムを作成します。まるっとプログラムを置き換えてください。

```test/sample-test.js
const { expect } = require("chai");
describe("NFT", function() {
  it("NFT basic test", async function() {
    const [signer, badSigner] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();
    expect(await nft.name()).to.equal("name");
    await nft.mint(signer.address);
    expect(await nft.balanceOf(signer.address)).to.equal(1);
    await expect(nft.connect(badSigner).mint(signer.address)).to.revertedWith("ERC721PresetMinterPauserAutoId: must have minter role to mint")
  });
});
```
上記は、コントラクトがデプロイできているか(nameが一致しているか)minter以外がmintできないかをテストで確認しています。

次に、デプロイのtest動作確認します。
``yarn localchain``で実行環境を起動したまま、別のシェルで``yarn test``を実行してエラーが出なければOKです。


次に、デプロイするサンプルを作成します。まるっとプログラムを置き換えてください。

```scripts/sample-script.js
const hre = require("hardhat");
async function main() {
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();
  await nft.deployed();
  console.log("Nft deployed to:", nft.address);
}
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});
```
上記はdeployしてコントラクトのアドレスを表示しています。

次に、deployの動作確認します。
``yarn localchain``で実行環境を起動したまま、別のシェルで``yarn deploy``を実行してエラーが出なければOKです。
このときに、``simpleNFT\packages\contracts\artifacts\contracts\NFT.sol\NFT.json``が作成されます。
**このファイルにはabi,bytecodeなどがあり、frontendでdeployするときに使うので、NFT.solを修正したらかならず``yarn deploy``実行してください。**

# frontendフォルダーでの環境構築

Reactプロジェクトを作成します

```
cd frontend
npx create-react-app .
```

次に、frontend/package.jsonのscriptsに追加します。

```frontend/package.json
"dev": "react-scripts start",
```
上記は``yarn dev``でreactを起動する設定です。

次に、設定を上書きするツールcracoをインストールします。ModuleScopePluginを削除して、importでsrc以外の外部ファイルが指定できるようになります。上記のNFT.jsonをimportするためです。
参考：

https://codehero.jp/javascript/44114436/the-create-react-app-imports-restriction-outside-of-src-directory

https://qiita.com/sakymark/items/6004f756e4b806f972ef


```
yarn add @craco/craco
```

次に、package.jsonのscriptsにcraco起動を追加します。

```frontend/package.json
"dev": "craco start",
"start": "craco start",
"build": "craco build",
"test": "craco test",
```

次に、frontend/craco.config.jsを作成して以下を記述。ModuleScopePluginを削除する設定です。

```frontend/craco.config.js
module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
          ({ constructor }) => constructor && constructor.name === "ModuleScopePlugin"
        );
  
        webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
        return webpackConfig;
      },
    },
  };
```

次に、Ethereumライブラリーを追加インストールします。

```
yarn add ethers 
```

次に、frontend/src/App.jsを下記のようにまるごと修正します。これがTopページになります。

```frontend/src/App.js
import './App.css';
//ethereumのライブラリー
import { ethers } from "ethers";
//NFT.solのdeployファイルをとりこむ。cracoを使ってModuleScopePluginの設定を削除しないとimportできない。
import {abi,bytecode} from "../../contracts/artifacts/contracts/NFT.sol/NFT.json";

//Providerを作成。Ethereumへのネットワーク接続を管理します。
const provider = new ethers.providers.Web3Provider(window.ethereum);
let address = "" //NFTのdeploy時のアドレスを指定する。
//Clickの処理.NFTをDeploy
const buttonDeploy = async() => {
  //署名を取得します。コントラクトの作成には署名が必要です。基本的に、コントラクトの生成や値が変わる処理にはマイニングが必要なので署名が必要です。
  const signer = provider.getSigner();
  //abi,bytecode,署名からコントラクトを作成するためのfactoryを作ります。
  const factory = new ethers.ContractFactory(abi,bytecode,signer);
  //NFTをdeployします。
  const contract = await factory.deploy();//metamaskの署名を要求する
  address = contract.address;//deployしたアドレス。
  console.log(contract);
  console.log(address);
  //rinkebyのchainidのときはetherscanのリンクを表示
  const net = await signer.provider.getNetwork();
  if( net.chainId == 4) console.log("https://rinkeby.etherscan.io/tx/" + contract.deployTransaction.hash);//Tx Hash Etherscanで探す。
};
//Clickの処理.consoleにnameが表示されればOK.Txがcommitされる前に押すとエラーになる。
const buttonGetName = async() => {
  const contract = new ethers.Contract(address, abi, provider);
  console.log(await contract.name())
  console.log(address);
};
//Clickの処理.NFTをmint
const buttonMint = async() => {
  const signer = provider.getSigner();
  //以前にdeployしたコントラクトのアドレスからコントラクトを特定します。
  const contract = new ethers.Contract(address, abi, provider);
  //署名を付けてコントラクトのmintを実行します。
  const {hash } = await contract.connect(signer).mint(signer.getAddress());//metamaskの署名を要求する
  console.log(contract);
  console.log(address);
  //rinkebyのchainidのときはetherscanのリンクを表示
  const net = await signer.provider.getNetwork();
  if( net.chainId == 4) console.log("https://rinkeby.etherscan.io/tx/" + hash);//Tx Hash Etherscanで探す。
};
//Clickの処理.NFTのtotalSupply
const buttonSupply = async() => {
  const contract = new ethers.Contract(address, abi, provider);
  console.log(address);
  console.log(await contract.totalSupply());
};
function App() {
  return (
    <div className="App">
    <p>動作</p>
    <button id="test" onClick={buttonDeploy}>NFT deploy</button><br/>
    <button id="test1" onClick={buttonGetName}>NFT get name</button><br/>
    <button id="test2" onClick={buttonMint}>NFT mint</button><br/>
    <button id="test2" onClick={buttonSupply}>NFT totalSupply</button>
    </div>
  );
}
export default App;
```

かなり細かくコメントを入れているので、これでUIからコントラクトを操作する処理は理解できると思います。

次に、動作確認をします。
contractsフォルダーで``yarn localchain``を起動したまま、frontendで``yarn dev``を起動してください。
ブラウザーから``http://localhost:3000`` で接続します。下記の画面が表示されます。chromeのデバッグコンソールも表示してください。

|![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/23175/44c7bc84-5815-4770-6169-17d1f0e6002f.png)|
|:--|


metamaskは下記のようにカスタムrpcに31337のチェーンIDをもつlocalhostのネットワークを追加してください。これがhardhatへの接続設定になります。

|![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/23175/3f285abf-3c70-2590-c727-435ee1c7ae14.png)|
|:--|

さらに下記のように``yarn localchain``の起動画面に秘密鍵が表示されているアカウントがいくつか表示されているので、適当な秘密鍵をmetamaskにインポートしてください。これでhardhat用のETHを取得したアカウントを取得することができます。このアカウントで動作確認を行います。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/23175/4cc18b4f-12e1-2522-0699-5878c6a5fa7e.png)

|![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/23175/ca07e908-8f9a-6bc1-2c11-b15aa3cbad18.png)|
|:--|

画面のボタンを押せば、上から、NFTのDeploy,nameの値の取得、mint、totalSupplyの値取得、を実行し結果がconsoleに表示されます。
起動時に毎回nonceがリセットされるので実行時にnonceエラーが表示されます。このときは下記のようにカスタムNonceに手動で期待する値を入力してください。
nonceとは実行の順番を管理する番号のことです。アカウントごとにインクリメントされていく数値です。

|![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/23175/34a7d4e5-ece3-7e2b-cdf2-2294aeee8381.png)|
|:--|

実行した後に、起動画面の緑のコメントが表示されます。これが実行が完了したメッセージなのでこれらが表示する前にほかのボタンを押すと、エラーになります。表示されるまで待ちましょう。これは実行＝トランザクションが完了してブロックに取り込まれたことを意味します。


![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/23175/b7af8a2c-99c8-46c2-6d5f-a2d419c54a9c.png)


# monorepo化。contractsとfrontendを統合する。

packagesにあるcontractsとfrontendを統合します。
simpleNFTフォルダー(root folder)に移動して作業をします。

simpleNFTフォルダーでプロジェクトを作成します。

```
npm init -y
```

package.jsonに以下を追加します。workspacesとしてpackages以下を定義しています。

```package.json
"private": true,
  "workspaces": [
    "packages/**"
  ],
```

スクリプト実行用のnpm-run-all wait-onをインストールします。

-Wがないとエラーになります。

```
yarn add -D npm-run-all wait-on -W
```
package.jsonのscriptsを下記のように修正します。yarn test,devで起動するときのスクリプトを記述しています。
yarn dev では"dev:*"が記述されているので、"dev:run-localchain","dev:deploy-contract-to-localchain","dev:frontend"も実行されます。

```package.json
"scripts": {
  "test": "yarn workspace contracts test",
  "dev": "run-p dev:*",
  "dev:run-localchain": "yarn workspace contracts localchain",
  "dev:deploy-contract-to-localchain": "wait-on http://localhost:8545 && yarn workspace contracts deploy",
  "dev:frontend": "wait-on http://localhost:8545 && yarn workspace frontend dev"
},
```

動作確認します。ローカル環境で起動します。

```
yarn dev
```
           
今まではcontracsとfrontend別々に起動していましたが統合したのでyarn devだけでlocalchain,frontendの起動、contracsのdeployができています。
次に、http://localhost:3000/ にブラウザから接続して確認します。


# Staging環境追加

テストネットrinkebyの環境をStaging環境として使います。その設定を行います。

simpleNFT/packages.jsonのscriptsに以下を追加します。

```simpleNFT/packages.json
"dev-staging": "run-p dev-staging:*",
"dev-staging:frontend": "yarn workspace frontend dev"
```
frontendを起動しているだけです。
Metamaskの接続先がrinkebyになるだけなので、特に開発環境には修正を入れていません。Metamaskの接続先がrinkebyになっていれば、NFTはrinkebyにdeployされます。

次に、動作確認します。

```
yarn dev-staging
```
metamaskはrikebyを選択。テストネットRinkebyでETHをもらっておいてください。https://faucet.rinkeby.io/ twitterで送金してほしいアドレスをつぶやいてURLを貼り付けると数時間以内にETHが送金されます。

次に、http://localhost:3000/ にブラウザから接続して確認します。
いままではローカルのhardhat環境にdeployしていましたが、deployボタンを押すとrinkebyにdeployされます。
deployするとconsoleにetherscanのリンクが表示されるので、successが表示されるまでトランザクションの完了を待ってから別のボタンを押しましょう。 

|![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/23175/c6c35a1b-1212-12c1-b862-c5a6d528afa2.png)|
|:--|

# まとめ
シンプルなNFTをDeployするための環境を構築構築をしました。DeployからmintまでUIで処理するコードも記載しています。かなり初心者でもわかりやすく書いたつもりです。これをベースにして、UIを含めたNFTサイトの開発は進められると思います。

今後は、
* NFTの処理自体は、シンプルなままなのでOpenseaにも対応した少しカスタムしたコントラクトの開発も追記する予定です。
* バックエンドに、Firebaseを追加して、DeployしたNFTの管理ができるようなサンプルコードも追記する予定です。
* 希望があればデジハリなどでハンズオン形式でセミナーも開きたいですね。



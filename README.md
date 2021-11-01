1. ehth-lightwallet, web3 모듈을 사용한 간단한 이더리움 월렛 만들기
    1) mnemonic코드(임의의 영문 12개 단어) 생성 (mnemonic : 지갑 생성 및 복구에 필요한 12개의 영단어 값)
    2) mnemonic코드와 password를 사용해서 keystore만들고 관리하기
    3) keystore를 사용해 tx에 서명을하고 , tx를 생성하여 이더리움블록체인에 배포하기 (코인보내기)
    4) mnemonic코드 복구, 내 keystore복구등등 다양한 기능 테스트
   
   Private Key(개인 키) : 
      '주소'와 프라이빗 키는 쌍으로 존재한다. 해당 주소로 접근하기 위한 키이며 찾기나 변경 불가능
   
   Keystore File :
      Private Key를 Password로 암호화 한 파일
   
   Mnemonic :
      12개(혹은 24개)의 영단어로 구성된 지갑 생성, 복구에 필요한 값.
export interface BiomassNode {
  id: string;
  title: string;
  species: string;
  message: string;
  img: string;
  quote: {
    text: string;
    author: string;
    context?: string;
  };
  rationale: string;
}

export const GENESIS_NODES: BiomassNode[] = [
  {
    id: "000",
    title: "THE GENESIS NODE (Khối Nguyên Thủy)",
    species: "Cây Chuối (The Banana Tree)",
    message: "Năng lượng khởi thủy không thuộc về ai; tụ lại để nuôi dưỡng, tan ra để tái sinh.",
    img: "🍌",
    quote: {
      text: "The primordial block hoards nothing; it gathers energy only to disburse it, collapsing into the foundation so the network may rise.",
      author: "Genesis Covenant"
    },
    rationale: "Sở hữu cấu trúc xoắn ốc vô cực (Fibonacci). Là bể thanh khoản sinh khối khổng lồ, che bóng mát và bơm nước cho vạn vật, sau đó tự ngã xuống làm nền tảng cho mạng lưới vươn lên mà không đòi hỏi sự đền đáp."
  },
  {
    id: "001",
    title: "THE PEER NODE (Hạt giống Khởi nguyên)",
    species: "Cây Đậu (The Bean)",
    message: "Một phiên bản thuần túy ngang hàng của tiền điện tử, cho phép các giao dịch trực tiếp.",
    img: "🫘",
    quote: {
      text: "A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution.",
      author: "Satoshi Nakamoto",
      context: "Câu mở đầu tiên trong phần Tóm tắt của Sách trắng Bitcoin. Xuất bản ngày 31/10/2008."
    },
    rationale: "Cây đậu có khả năng cố định đạm từ không khí và chia sẻ trực tiếp dưỡng chất xuống đất thông qua nốt sần ở rễ mà không cần phân bón nhân tạo. Đây là cơ chế trao đổi 'ngang hàng' nguyên thủy và thuần khiết nhất của tự nhiên."
  },
  {
    id: "002",
    title: "THE NETWORK NODE (Sự hình thành)",
    species: "Cỏ Hương Bài (Vetiver)",
    message: "Mạng lưới trở nên vững chãi chính nhờ sự đơn giản trong cấu trúc của nó.",
    img: "🌱",
    quote: {
      text: "The network is robust in its unstructured simplicity.",
      author: "Satoshi Nakamoto",
      context: "Đoạn kết luận trong Sách trắng Bitcoin. 31/10/2008."
    },
    rationale: "Tuy chỉ là loài cỏ đơn sơ trên mặt đất, nhưng Hương Bài sở hữu bộ rễ đâm sâu hàng mét, đan kết chặt chẽ thành một mạng lưới ngầm chống lại mọi sự xói mòn. Sự hình thành của mạng lưới vĩ đại nhất luôn bắt đầu từ những rễ cỏ đan xen tĩnh lặng nhất."
  },
  {
    id: "003",
    title: "THE SEED NODE (Sự kế thừa)",
    species: "Cây Cẩm Lai (Rosewood)",
    message: "Mỗi tài sản số là một hạt giống di sản, được gieo trồng cho thế hệ mai sau.",
    img: "🌳",
    quote: {
      text: "Each digital asset is a heritage seed, planted for future generations.",
      author: "Genesis Covenant"
    },
    rationale: "Loài gỗ quý hiếm, sinh trưởng vô cùng chậm rãi nhưng trường tồn hàng trăm năm. Việc gieo hạt Cẩm Lai hôm nay không phải để thế hệ này thu hoạch, mà là để lại một khối tài sản, một di sản bất biến cho sự kế thừa của tương lai xa."
  },
  {
    id: "004",
    title: "THE GERMINATION NODE (Mầm Tình Yêu)",
    species: "Mạ Non (Rice Seedling)",
    message: "Sự sống bắt đầu khi mã nguồn tìm thấy mảnh đất của niềm tin.",
    img: "🌾",
    quote: {
      text: "Life begins when the source code finds the soil of trust.",
      author: "Genesis Covenant"
    },
    rationale: "Tri ân trực tiếp đến 'Cuộc Cách Mạng Một Cọng Rơm' của Masanobu Fukuoka. Một mầm lúa nhỏ bé nảy mầm từ bùn lầy chính là khởi nguồn của sự nuôi dưỡng."
  },
  {
    id: "005",
    title: "THE ROOT NODE (Sự bám rễ)",
    species: "Cây Đước (Mangrove)",
    message: "Nền tảng thực sự không nằm ở bề nổi, mà ở độ sâu của những kết nối vô hình.",
    img: "🏝️",
    quote: {
      text: "The true foundation lies not on the surface, but in the depth of invisible connections.",
      author: "Genesis Covenant"
    },
    rationale: "Sống ở ranh giới giao thoa đầy khắc nghiệt giữa đất và biển. Hệ thống rễ phụ đan chéo, cắm sâu dưới mặt nước tạo nên bức tường thành vững chắc cản sóng."
  },
  {
    id: "006",
    title: "THE WISDOM NODE (Sự tỉnh thức)",
    species: "Cây Bồ Đề (Bodhi)",
    message: "Sức mạnh thực sự nằm ở sự thấu hiểu dòng chảy của hệ thống.",
    img: "🍃",
    quote: {
      text: "True power lies in understanding the flow of the system.",
      author: "Genesis Covenant"
    },
    rationale: "Loài cây gắn liền với sự giác ngộ. Rễ và cành vươn ra theo mọi hướng để tìm kiếm ánh sáng và dưỡng chất."
  },
  {
    id: "007",
    title: "THE FLOW NODE (Sự thanh lọc)",
    species: "Hoa Sen (Lotus)",
    message: "Giá trị không đứng yên; nó luân chuyển như nước, thanh lọc và nuôi dưỡng mạng lưới.",
    img: "🪷",
    quote: {
      text: "Value does not stand still; it circulates like water, purifying and nourishing the network.",
      author: "Genesis Covenant"
    },
    rationale: "Sinh ra từ bùn sâu nhưng vươn lên tinh khiết, Sen dùng nước để luân chuyển dưỡng chất và giữ mình thanh sạch."
  },
  {
    id: "008",
    title: "THE BALANCE NODE (Sự cân bằng)",
    species: "Cây Trinh Nữ (Mimosa)",
    message: "Trạng thái cân bằng động là nhịp đập giúp hệ sinh thái tự điều chỉnh.",
    img: "🌿",
    quote: {
      text: "Dynamic equilibrium is the heartbeat that allows the ecosystem to self-adjust.",
      author: "Genesis Covenant"
    },
    rationale: "Cơ chế khép lá tức thời trước tác động mạnh để bảo toàn năng lượng và từ từ mở ra khi an toàn. Một cỗ máy 'cân bằng' tự nhiên."
  },
  {
    id: "009",
    title: "THE EXPANSION NODE (Sự lan tỏa)",
    species: "Dây Lang (Sweet Potato Vine)",
    message: "Mạng lưới mở rộng không bằng cách chiếm hữu, mà bằng cách bao hàm tất cả.",
    img: "🍠",
    quote: {
      text: "The network expands not by possession, but by inclusion of all.",
      author: "Genesis Covenant"
    },
    rationale: "Bò đến đâu, rễ cắm đến đó. Tốc độ lan tỏa nhanh nhưng không tiêu diệt loài khác. Che phủ bề mặt, giữ ẩm cho đất."
  },
  {
    id: "010",
    title: "THE HARMONY NODE (Sự cộng sinh)",
    species: "Địa Y (Lichen)",
    message: "Sự giao thoa hoàn hảo giữa các thuật toán và quy luật tự nhiên.",
    img: "🧗",
    quote: {
      text: "The perfect intersection between algorithms and the laws of nature.",
      author: "Genesis Covenant"
    },
    rationale: "Sự cộng sinh giữa Nấm và Tảo. Tảo quang hợp, nấm giữ nước. Giống hệt sự hòa hợp giữa con người và thuật toán RGB."
  },
  {
    id: "011",
    title: "THE BUILDER NODE (Sự kiến tạo)",
    species: "Nha Đam (Aloe Vera)",
    message: "Tôi giỏi viết mã hơn là dùng lời nói để diễn đạt.",
    img: "🪴",
    quote: {
      text: "I am better with code than with words though.",
      author: "Satoshi Nakamoto",
      context: "Viết trên Cryptography Mailing List. 13/11/2008."
    },
    rationale: "Tồn tại ở vùng khô hạn, âm thầm tích lũy nhựa sống và tự chữa lành. Tập trung vào hành động thực chất bên trong thay vì phô trương."
  },
  {
    id: "012",
    title: "THE RESISTANCE NODE (Sự tự do)",
    species: "Xương Rồng (Cactus)",
    message: "Giành chiến thắng trong cuộc chạy đua vũ trang để kiến tạo một vùng lãnh thổ tự do.",
    img: "🌵",
    quote: {
      text: "We can win a major battle in the arms race and gain a new territory of freedom for several years.",
      author: "Satoshi Nakamoto",
      context: "Gửi Hal Finney về khía cạnh chính trị của Bitcoin. 07/11/2008."
    },
    rationale: "Biểu tượng kháng cự tại sa mạc khắc nghiệt. Tự tạo lớp giáp gai để bảo vệ sự sống bên trong, tạo nên một vùng lãnh thổ tự do."
  },
  {
    id: "013",
    title: "THE COMPASSION NODE (Sự dâng hiến)",
    species: "Vú Sữa (Star Apple)",
    message: "Những đồng tiền mất đi chỉ làm tăng giá trị của những người còn lại. Hãy coi đó là sự hiến dâng.",
    img: "🍎",
    quote: {
      text: "Lost coins only make everyone else's coins worth slightly more. Think of it as a donation to everyone.",
      author: "Satoshi Nakamoto",
      context: "Diễn đàn BitcoinTalk, 'Dying bitcoins'. 21/06/2010."
    },
    rationale: "Mang dòng nhựa trắng như sữa mẹ nuôi dưỡng vạn vật. Sự hy sinh là sự dâng hiến để làm giàu thêm giá trị cho cộng đồng."
  },
  {
    id: "014",
    title: "THE EVOLUTION NODE (Sự chuyển hóa)",
    species: "Thường Xuân (Ivy)",
    message: "Bản chất kiểm soát tập trung là mầm mống dẫn đến sự sụp đổ của các hệ thống cũ.",
    img: "🧗‍♂️",
    quote: {
      text: "Centralized control is the seed of collapse for the old systems.",
      author: "Genesis Covenant"
    },
    rationale: "Khả năng vươn mình bám rễ, dần dần bao phủ và chuyển hóa những khối bê tông cứng nhắc của thế giới cũ thành màu xanh phi tập trung."
  },
  {
    id: "015",
    title: "THE PATIENCE NODE (Sự kiên tâm)",
    species: "Hoa Mai (Apricot Blossom)",
    message: "Dự án cần phát triển dần dần để phần mềm được tôi luyện và vững chắc hơn.",
    img: "🌸",
    quote: {
      text: "The project needs to grow gradually so the software can be strengthened along the way.",
      author: "Satoshi Nakamoto",
      context: "Diễn đàn BitcoinTalk. 05/12/2010."
    },
    rationale: "Chịu đựng giá lạnh suốt mùa đông để bung nở rạng rỡ nhất vào mùa xuân. Một sự kiên tâm chờ đợi thời điểm chín muồi."
  },
  {
    id: "016",
    title: "THE UTILITY NODE (Sự hữu dụng)",
    species: "Cây Tràm (Melaleuca)",
    message: "Tiện ích của các giao dịch sẽ vượt xa chi phí năng lượng mà nó tiêu thụ.",
    img: "🌳",
    quote: {
      text: "The utility of the exchanges made possible by Bitcoin will far exceed the cost of electricity used.",
      author: "Satoshi Nakamoto",
      context: "Diễn đàn BitcoinTalk. 07/08/2010."
    },
    rationale: "Sống mạnh mẽ ở vùng đất chết, bộ rễ lọc sạch phèn chua để cải tạo môi trường."
  },
  {
    id: "017",
    title: "THE INDEPENDENT NODE (Sự tự tại)",
    species: "Lan Rừng (Wild Orchid)",
    message: "Một hệ thống giao dịch điện tử vận hành mà không cần phụ thuộc vào niềm tin.",
    img: "🌸",
    quote: {
      text: "What is needed is an electronic payment system based on cryptographic proof instead of trust...",
      author: "Satoshi Nakamoto",
      context: "Phần giới thiệu của Sách trắng Bitcoin. 31/10/2008."
    },
    rationale: "Không cần cắm rễ vào đất, tự lấy dưỡng chất từ không khí. Sự độc lập tuyệt đối, không cần định chế hay niềm tin đặt sai chỗ."
  },
  {
    id: "018",
    title: "THE RESILIENT NODE (Sự tái sinh)",
    species: "Nấm Bào Ngư (Oyster Mushroom)",
    message: "Sự tái sinh là phản xạ tự nhiên của hệ thống trước mọi đe dọa.",
    img: "🍄",
    quote: {
      text: "Regeneration is the system's natural reflex to every threat.",
      author: "Genesis Covenant"
    },
    rationale: "Mạng lưới hệ sợi nấm (mycelium) ngầm dưới đất không thể bị tiêu diệt bởi lửa. Nó âm thầm phân hủy tàn tro để bắt đầu chu kỳ tái sinh."
  },
  {
    id: "019",
    title: "THE AUTONOMOUS NODE (Sự tự trị)",
    species: "Cây Tre (Bamboo)",
    message: "Một khi phiên bản gốc được phát hành, thiết kế cốt lõi của nó đã được khắc vào đá.",
    img: "🎋",
    quote: {
      text: "The core design of Bitcoin was set in stone.",
      author: "Satoshi Nakamoto",
      context: "Diễn đàn BitcoinTalk. 17/06/2010."
    },
    rationale: "Sinh trưởng từ bộ gốc ngầm bền bỉ. Thiết kế lóng tre rỗng nhưng dẻo dai cho phép cây tự đứng vững và phát triển tự trị."
  },
  {
    id: "020",
    title: "THE INTEGRATIVE NODE (Sự sung túc)",
    species: "Cây Sung (Cluster Fig)",
    message: "Sự tích lũy bền bỉ sẽ tạo nên sự thịnh vượng chung cho toàn bộ tập thể.",
    img: "🌳",
    quote: {
      text: "Persistent accumulation creates collective prosperity for the entire community.",
      author: "Genesis Covenant"
    },
    rationale: "Những chùm quả sung dày đặc bám chặt lấy thân mẹ biểu trưng cho sự đoàn kết và tích lũy."
  },
  {
    id: "021",
    title: "THE SYNTHESIS NODE (Sự hợp nhất)",
    species: "Cây Đa Cổ Thụ (Ancient Banyan)",
    message: "Giao ước vĩnh cửu; sự gắn kết không thể tách rời của mạng lưới.",
    img: "🌳",
    quote: {
      text: "Eternal Covenant; the inseparable bond of the network.",
      author: "Genesis Covenant"
    },
    rationale: "Hàng ngàn rễ phụ buông xuống biến thành những thân cây mới, tạo nên một mạng lưới hợp nhất vô cực."
  },
  {
    id: "022",
    title: "THE IMMUTABLE NODE (Sự bất biến)",
    species: "Cây Giá Tỵ (Teak)",
    message: "Giá trị đích thực tự sinh ra lớp khiên bảo vệ nội tại, trường tồn và miễn nhiễm với sự tha hóa của thời gian.",
    img: "🪵",
    quote: {
      text: "A true store of value generates its own inner shield, enduring and impervious to the corruption of time.",
      author: "Genesis Covenant"
    },
    rationale: "Tự sinh ra lớp tinh dầu bên trong chống lại mối mọt. Một pháo đài lưu trữ giá trị vật lý và bất biến."
  },
  {
    id: "023",
    title: "THE CLARITY NODE (Sự trong trẻo)",
    species: "Cây Chè (Tea Tree)",
    message: "Sự trong trẻo của tâm trí giúp dọn dẹp hệ thống và nhìn thấu bản chất của dòng chảy.",
    img: "🍵",
    quote: {
      text: "The clarity of mind clears the mempool, allowing one to see the true nature of the flow.",
      author: "Genesis Covenant"
    },
    rationale: "Đưa sóng não về trạng thái Alpha thư giãn. Dọn dẹp bộ nhớ đệm (mempool) của tâm hồn, loại bỏ tạp âm."
  },
  {
    id: "024",
    title: "THE HASHRATE NODE (Sự thức tỉnh)",
    species: "Cây Cà Phê (Coffee Tree)",
    message: "Năng lượng đột phá để giải quyết những thuật toán phức tạp nhất của thực tại.",
    img: "☕",
    quote: {
      text: "Breakthrough energy to solve the most complex algorithms of reality.",
      author: "Genesis Covenant"
    },
    rationale: "Hấp thụ dưỡng chất từ đất mẹ để tổng hợp thành Caffeine. Đóng vai trò 'ép xung' (overclocking) cho mạng lưới thần kinh."
  }
];

from langchain_text_splitters import RecursiveCharacterTextSplitter


class TextSplitter:
    """文本分割器"""

    def __init__(self, chunk_size: int = 512, chunk_overlap: int = 64):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", "。", "！", "？", " ", ""],
            length_function=len
        )

    def split(self, documents: list) -> list:
        """分割文档"""
        return self.splitter.split_documents(documents)

    def split_text(self, text: str) -> list:
        """分割文本"""
        return self.splitter.split_text(text)

"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
    {
        question: "Claira là gì?",
        answer: "Claira là hệ thống tự động hóa xét duyệt bồi thường bảo hiểm y tế bằng công nghệ AI và GenAI, giúp rút ngắn thời gian xử lý từ vài ngày xuống còn vài phút.",
    },
    {
        question: "Hệ thống có thể trích xuất dữ liệu từ các tài liệu viết tay không?",
        answer: "Có, AI của chúng tôi sử dụng các mô hình VLM tiên tiến có khả năng nhận diện và trích xuất dữ liệu từ các đơn thuốc viết tay, hóa đơn in mờ và các tài liệu PDF scan.",
    },
    {
        question: "Độ chính xác của hệ thống là bao nhiêu?",
        answer: "Hệ thống đạt độ chính xác trích xuất dữ liệu trên 90% và độ chính xác phân loại tài liệu trên 95%.",
    },
    {
        question: "Dữ liệu y tế của khách hàng có được bảo mật không?",
        answer: "Chúng tôi cam kết bảo mật dữ liệu tuyệt đối theo các tiêu chuẩn ngành bảo hiểm. Dữ liệu được mã hóa và chỉ sử dụng cho mục đích thẩm định bồi thường.",
    },
]

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <section id="faq" className="relative py-24 bg-white overflow-hidden">
            <div className="max-w-3xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
                    className="text-center mb-12"
                >
                    <motion.span
                        className="font-mono text-[#3B82F6] text-xs tracking-widest inline-block"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        HỖ TRỢ
                    </motion.span>
                    <h2 className="text-3xl md:text-5xl font-black text-[#121212] tracking-tighter mt-2">
                        CÂU HỎI THƯỜNG GẶP
                    </h2>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="border border-blue-100 rounded-2xl overflow-hidden bg-white shadow-sm"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left group"
                            >
                                <span className="text-lg font-bold text-[#121212] group-hover:text-[#3B82F6] transition-colors">
                                    {faq.question}
                                </span>
                                {openIndex === index ? (
                                    <ChevronUp className="text-[#3B82F6]" />
                                ) : (
                                    <ChevronDown className="text-[#121212]/40 group-hover:text-[#3B82F6]" />
                                )}
                            </button>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className="px-6 pb-5 text-[#121212]/60 font-mono text-sm leading-relaxed"
                                >
                                    {faq.answer}
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
